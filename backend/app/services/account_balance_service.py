"""
계정 잔액(Account Balance) Service

계정별 차변/대변 합계와 잔액을 요약 테이블에 저장합니다.
"""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Iterable, Sequence

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.account_balance import AccountBalance
from app.models.journal_entry import JournalEntry
from app.models.journal_line import JournalLine


class AccountBalanceService:
    """
    계정 잔액 요약 서비스

    분개 변경 시 영향받는 계정의 차변/대변 합계와 잔액을 재계산하여
    account_balances 테이블을 최신 상태로 유지합니다.
    """

    def __init__(self, db: Session):
        """
        Args:
            db: 데이터베이스 세션
        """
        self.db = db

    def recalculate_balances(self, account_ids: Iterable[int] | None = None) -> None:
        """
        지정된 계정(또는 전체 계정)의 차변/대변 합계와 잔액을 재계산합니다.

        Args:
            account_ids: 재계산할 계정 ID 목록. None이면 전체 계정.
        """
        accounts_query = self.db.query(Account)
        id_list: Sequence[int] | None = None

        if account_ids is not None:
            unique_ids = {acc_id for acc_id in account_ids if acc_id is not None}
            if not unique_ids:
                return
            id_list = list(unique_ids)
            accounts_query = accounts_query.filter(Account.id.in_(id_list))

        accounts = accounts_query.all()
        if not accounts:
            return

        if id_list is None:
            id_list = [account.id for account in accounts]

        aggregates = self._fetch_aggregates(id_list)
        existing_map = self._fetch_existing_records(id_list)
        now = datetime.utcnow()

        for account in accounts:
            total_debit, total_credit = aggregates.get(
                account.id, (Decimal("0"), Decimal("0"))
            )
            balance_value = total_debit - total_credit

            record = existing_map.get(account.id)
            if record:
                record.total_debit = total_debit
                record.total_credit = total_credit
                record.balance = balance_value
                record.updated_at = now
            else:
                record = AccountBalance(
                    account_id=account.id,
                    total_debit=total_debit,
                    total_credit=total_credit,
                    balance=balance_value,
                    updated_at=now,
                )
                self.db.add(record)

    def _fetch_aggregates(self, account_ids: Sequence[int]) -> dict[int, tuple[Decimal, Decimal]]:
        """분개 라인에서 계정별 차변/대변 합계를 계산합니다."""
        if not account_ids:
            return {}

        totals = (
            self.db.query(
                JournalLine.account_id,
                func.coalesce(func.sum(JournalLine.debit), 0).label("total_debit"),
                func.coalesce(func.sum(JournalLine.credit), 0).label("total_credit"),
            )
            .join(JournalEntry, JournalEntry.id == JournalLine.entry_id)
            .filter(
                JournalLine.account_id.in_(account_ids),
                JournalEntry.is_deleted == False,
            )
            .group_by(JournalLine.account_id)
            .all()
        )

        return {
            row.account_id: (
                Decimal(row.total_debit or 0),
                Decimal(row.total_credit or 0),
            )
            for row in totals
        }

    def _fetch_existing_records(self, account_ids: Sequence[int]) -> dict[int, AccountBalance]:
        """기존 잔액 레코드를 조회해 딕셔너리로 반환합니다."""
        if not account_ids:
            return {}

        records = (
            self.db.query(AccountBalance)
            .filter(AccountBalance.account_id.in_(account_ids))
            .all()
        )
        return {record.account_id: record for record in records}
