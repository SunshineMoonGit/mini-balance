"""
시산표(Trial Balance) Repository

합계 시산표(A 방식): 차변 합계 + 대변 합계 + 잔액
"""
from datetime import date
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.account import Account, AccountType
from app.models.journal_entry import JournalEntry
from app.models.journal_line import JournalLine
from app.services.trial_balance_types import RecentEntryRecord, TrialBalanceEntry


class TrialBalanceRepository:
    """시산표 Repository"""

    def __init__(self, db: Session):
        self.db = db

    def calculate_trial_balance(
        self,
        from_date: date,
        to_date: date
    ) -> list[TrialBalanceEntry]:
        """
        시산표 계산 (A 방식: 합계 시산표)

        N+1 문제를 방지하기 위해 계정별 합계를 한 번의 쿼리로 조회합니다.

        Args:
            from_date: 시작일
            to_date: 종료일

        Returns:
            계정별 시산표 데이터 리스트
        """
        # 1. 활성 계정 목록 조회 (필요한 필드만)
        accounts = (
            self.db.query(Account.id, Account.code, Account.name, Account.type)
            .filter(Account.is_active == True)
            .all()
        )

        if not accounts:
            return []

        account_map = {acc.id: acc for acc in accounts}
        account_ids = list(account_map.keys())

        # 2. 모든 계정의 차변/대변 합계를 한 번에 조회 (N+1 문제 해결)
        totals_map = self._calculate_all_period_totals(account_ids, from_date, to_date)

        # 3. 모든 계정의 거래 건수와 최근 거래를 한 번에 조회
        counts_map, recent_map = self._get_all_recent_transactions(
            account_ids, from_date, to_date
        )

        # 4. 결과 조합
        entries: list[TrialBalanceEntry] = []

        for acc_id, account in account_map.items():
            total_debit, total_credit = totals_map.get(acc_id, (Decimal("0"), Decimal("0")))
            balance = total_debit - total_credit
            transaction_count = counts_map.get(acc_id, 0)
            recent_entries = recent_map.get(acc_id, [])

            entries.append(
                TrialBalanceEntry(
                    account_id=account.id,
                    account_code=account.code,
                    account_name=account.name,
                    type=account.type,
                    total_debit=total_debit,
                    total_credit=total_credit,
                    balance=balance,
                    transaction_count=transaction_count,
                    recent_entries=[
                        RecentEntryRecord(
                            date=entry["date"],
                            description=entry["description"],
                            debit=entry["debit"],
                            credit=entry["credit"],
                        )
                        for entry in recent_entries
                    ],
                )
            )

        return entries

    def _calculate_all_period_totals(
        self,
        account_ids: list[int],
        from_date: date,
        to_date: date
    ) -> dict[int, tuple[Decimal, Decimal]]:
        """
        모든 계정의 기간 내 차변/대변 합계를 한 번에 계산 (N+1 문제 해결)

        Args:
            account_ids: 계정 ID 목록
            from_date: 시작일
            to_date: 종료일

        Returns:
            {account_id: (차변 합계, 대변 합계)} 딕셔너리
        """
        if not account_ids:
            return {}

        results = (
            self.db.query(
                JournalLine.account_id,
                func.coalesce(func.sum(JournalLine.debit), 0).label("total_debit"),
                func.coalesce(func.sum(JournalLine.credit), 0).label("total_credit")
            )
            .join(JournalEntry, JournalEntry.id == JournalLine.entry_id)
            .filter(
                JournalLine.account_id.in_(account_ids),
                JournalEntry.is_deleted == False,
                JournalEntry.date >= from_date,
                JournalEntry.date <= to_date
            )
            .group_by(JournalLine.account_id)
            .all()
        )

        return {
            row.account_id: (
                Decimal(str(row.total_debit or 0)),
                Decimal(str(row.total_credit or 0))
            )
            for row in results
        }

    def calculate_totals_before_period(
        self,
        account_ids: list[int],
        from_date: date,
    ) -> dict[int, tuple[Decimal, Decimal]]:
        """
        기간 시작 이전까지의 모든 계정의 차변/대변 합계를 계산

        Args:
            account_ids: 계정 ID 목록
            from_date: 조회 시작일 (포함하지 않음)

        Returns:
            {account_id: (차변 합계, 대변 합계)} 딕셔너리
        """
        if not account_ids:
            return {}

        results = (
            self.db.query(
                JournalLine.account_id,
                func.coalesce(func.sum(JournalLine.debit), 0).label("total_debit"),
                func.coalesce(func.sum(JournalLine.credit), 0).label("total_credit")
            )
            .join(JournalEntry, JournalEntry.id == JournalLine.entry_id)
            .filter(
                JournalLine.account_id.in_(account_ids),
                JournalEntry.is_deleted == False,
                JournalEntry.date < from_date
            )
            .group_by(JournalLine.account_id)
            .all()
        )

        return {
            row.account_id: (
                Decimal(str(row.total_debit or 0)),
                Decimal(str(row.total_credit or 0))
            )
            for row in results
        }

    def _get_all_recent_transactions(
        self,
        account_ids: list[int],
        from_date: date,
        to_date: date,
        limit: int = 5
    ) -> tuple[dict[int, int], dict[int, list]]:
        """
        모든 계정의 거래 건수와 최근 거래를 한 번에 조회 (N+1 문제 해결)

        Args:
            account_ids: 계정 ID 목록
            from_date: 시작일
            to_date: 종료일
            limit: 계정당 최근 거래 조회 수

        Returns:
            (거래 건수 딕셔너리, 최근 거래 딕셔너리)
        """
        if not account_ids:
            return {}, {}

        # 1. 거래 건수 계산
        count_results = (
            self.db.query(
                JournalLine.account_id,
                func.count(JournalLine.id).label("count")
            )
            .join(JournalEntry, JournalEntry.id == JournalLine.entry_id)
            .filter(
                JournalLine.account_id.in_(account_ids),
                JournalEntry.is_deleted == False,
                JournalEntry.date >= from_date,
                JournalEntry.date <= to_date
            )
            .group_by(JournalLine.account_id)
            .all()
        )

        counts_map = {row.account_id: row.count for row in count_results}

        # 2. 최근 거래 조회 (윈도우 함수 또는 서브쿼리 사용)
        # SQLite는 윈도우 함수를 지원하므로 ROW_NUMBER를 사용할 수 있습니다
        from sqlalchemy import literal_column

        # 각 계정별로 최근 거래를 조회
        lines = (
            self.db.query(
                JournalLine.account_id,
                JournalEntry.date,
                JournalEntry.description,
                JournalLine.debit,
                JournalLine.credit
            )
            .join(JournalEntry, JournalEntry.id == JournalLine.entry_id)
            .filter(
                JournalLine.account_id.in_(account_ids),
                JournalEntry.is_deleted == False,
                JournalEntry.date >= from_date,
                JournalEntry.date <= to_date
            )
            .order_by(
                JournalLine.account_id,
                JournalEntry.date.desc(),
                JournalEntry.id.desc()
            )
            .all()
        )

        # 계정별로 그룹화하고 limit 적용
        recent_map: dict[int, list] = {}
        for line in lines:
            acc_id = line.account_id
            if acc_id not in recent_map:
                recent_map[acc_id] = []

            if len(recent_map[acc_id]) < limit:
                recent_map[acc_id].append({
                    "date": str(line.date),
                    "description": line.description,
                    "debit": line.debit,
                    "credit": line.credit,
                })

        return counts_map, recent_map

    def _calculate_period_totals(
        self,
        account_id: int,
        from_date: date,
        to_date: date
    ) -> tuple[Decimal, Decimal]:
        """
        기간 내 차변/대변 합계 계산

        Args:
            account_id: 계정 ID
            from_date: 시작일
            to_date: 종료일

        Returns:
            (차변 합계, 대변 합계)
        """
        result = (
            self.db.query(
                func.coalesce(func.sum(JournalLine.debit), 0).label("total_debit"),
                func.coalesce(func.sum(JournalLine.credit), 0).label("total_credit")
            )
            .join(JournalEntry, JournalEntry.id == JournalLine.entry_id)
            .filter(
                JournalLine.account_id == account_id,
                JournalEntry.is_deleted == False,
                JournalEntry.date >= from_date,
                JournalEntry.date <= to_date
            )
            .first()
        )

        if not result:
            return Decimal("0.00"), Decimal("0.00")

        total_debit = Decimal(result.total_debit or 0)
        total_credit = Decimal(result.total_credit or 0)

        return total_debit, total_credit

    def _get_recent_transactions(
        self,
        account_id: int,
        from_date: date,
        to_date: date,
        limit: int = 5
    ) -> tuple[int, list]:
        """
        최근 거래 내역 조회

        Args:
            account_id: 계정 ID
            from_date: 시작일
            to_date: 종료일
            limit: 조회할 최대 거래 수

        Returns:
            (총 거래 건수, 최근 거래 리스트)
        """
        # 거래 건수 계산
        count = (
            self.db.query(JournalLine)
            .join(JournalEntry, JournalEntry.id == JournalLine.entry_id)
            .filter(
                JournalLine.account_id == account_id,
                JournalEntry.is_deleted == False,
                JournalEntry.date >= from_date,
                JournalEntry.date <= to_date
            )
            .count()
        )

        # 최근 거래 조회
        lines = (
            self.db.query(JournalLine, JournalEntry)
            .join(JournalEntry, JournalEntry.id == JournalLine.entry_id)
            .filter(
                JournalLine.account_id == account_id,
                JournalEntry.is_deleted == False,
                JournalEntry.date >= from_date,
                JournalEntry.date <= to_date
            )
            .order_by(JournalEntry.date.desc(), JournalEntry.id.desc())
            .limit(limit)
            .all()
        )

        recent_entries = [
            {
                "date": str(entry.date),
                "description": entry.description,
                "debit": line.debit,
                "credit": line.credit,
            }
            for line, entry in lines
        ]

        return count, recent_entries

    def get_normal_balance_direction(self, account_type: AccountType) -> str:
        """
        계정 타입별 정상 잔액 방향 반환

        Args:
            account_type: 계정 타입

        Returns:
            "DEBIT" 또는 "CREDIT"
        """
        # 자산, 비용: 차변이 정상 잔액
        if account_type in [AccountType.ASSET, AccountType.EXPENSE]:
            return "DEBIT"
        # 부채, 자본, 수익: 대변이 정상 잔액
        else:
            return "CREDIT"
