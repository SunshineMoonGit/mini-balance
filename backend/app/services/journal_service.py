"""
분개(Journal Entry) Service

비즈니스 로직을 담당합니다.
"""
from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.account import Account
from app.repositories.journal_repo import JournalRepository
from app.repositories.account_repo import AccountRepository
from app.schemas.journal_schema import JournalEntryCreate, JournalEntryUpdate, JournalLineCreate
from app.schemas.common import ErrorCode, ErrorMessage
from app.services.account_balance_service import AccountBalanceService
from app.core.exceptions import (
    bad_request,
    not_found,
    unprocessable_entity,
    validate_date_range,
    with_transaction
)


class JournalService:
    """
    분개 서비스

    분개 생성, 조회, 수정, 삭제 및 검증 로직을 담당합니다.
    """

    def __init__(self, db: Session):
        """
        Args:
            db: 데이터베이스 세션
        """
        self.db = db
        self.repo = JournalRepository(db)
        self.account_repo = AccountRepository(db)
        self.balance_service = AccountBalanceService(db)

    def list_entries(
        self,
        from_date: date | None = None,
        to_date: date | None = None,
        limit: int = 50,
        offset: int = 0,
    ):
        """
        분개 목록 조회

        Args:
            from_date: 시작일
            to_date: 종료일
            limit: 조회 건수 제한
            offset: 페이지 오프셋

        Returns:
            분개 목록 (최신순 정렬, 라인과 계정 정보 포함)
        """
        validate_date_range(from_date, to_date)
        return self.repo.list_entries(from_date, to_date, limit, offset)

    def get_entry(self, entry_id: int):
        """
        분개 단건 조회

        Args:
            entry_id: 분개 ID

        Returns:
            분개 객체 (라인과 계정 정보 포함)

        Raises:
            HTTPException(404): 분개를 찾을 수 없는 경우
        """
        entry = self.repo.get_by_id(entry_id)
        if not entry:
            raise not_found(
                ErrorCode.JOURNAL_ENTRY_NOT_FOUND,
                ErrorMessage.JOURNAL_ENTRY_NOT_FOUND,
                {"entry_id": entry_id}
            )
        return entry

    @with_transaction
    def create_entry(self, payload: JournalEntryCreate):
        """
        분개 생성

        차변/대변 검증 및 계정 유효성 검증을 수행합니다.

        Args:
            payload: 분개 생성 데이터

        Returns:
            생성된 분개 (라인과 계정 정보 포함)

        Raises:
            HTTPException(400): 계정 유효성 검증 실패 또는 차대변 불일치
        """
        # 1. 계정 유효성 검증
        self._validate_accounts(payload.lines)

        # 2. 차변/대변 합계 검증 (Pydantic에서도 하지만 이중 체크)
        self._validate_totals(payload.lines)

        # 3. 분개 생성 및 잔액 재계산
        entry = self.repo.create_entry(payload)
        affected_ids = {line.account_id for line in entry.lines}
        self.balance_service.recalculate_balances(affected_ids)

        return entry

    @with_transaction
    def update_entry(self, entry_id: int, payload: JournalEntryUpdate):
        """
        분개 수정

        Args:
            entry_id: 분개 ID
            payload: 수정 데이터

        Returns:
            수정된 분개 (라인과 계정 정보 포함)

        Raises:
            HTTPException(404): 분개를 찾을 수 없는 경우
            HTTPException(400): 검증 실패
        """
        entry = self.get_entry(entry_id)

        # 검증
        self._validate_accounts(payload.lines)
        self._validate_totals(payload.lines)

        # 영향받는 계정 ID 수집 (이전 + 새로운)
        original_account_ids = {line.account_id for line in entry.lines}

        # 분개 수정
        updated = self.repo.update_entry(entry, payload)
        updated_account_ids = {line.account_id for line in updated.lines}
        affected_ids = original_account_ids.union(updated_account_ids)

        # 영향받는 모든 계정의 잔액 재계산
        self.balance_service.recalculate_balances(affected_ids)

        return updated

    @with_transaction
    def delete_entry(self, entry_id: int):
        """
        분개 삭제 (soft-delete)

        물리적 삭제가 아닌 is_deleted 플래그를 True로 설정합니다.

        Args:
            entry_id: 분개 ID

        Returns:
            삭제된 분개

        Raises:
            HTTPException(404): 분개를 찾을 수 없는 경우
        """
        entry = self.get_entry(entry_id)
        affected_ids = {line.account_id for line in entry.lines}

        # soft-delete 처리
        deleted = self.repo.delete_entry(entry)

        # 영향받는 계정의 잔액 재계산
        self.balance_service.recalculate_balances(affected_ids)

        return deleted

    def get_summary_list(
        self,
        from_date: date | None = None,
        to_date: date | None = None,
        limit: int = 50
    ):
        """
        분개 목록 요약 조회

        각 분개의 ID, 날짜, 적요, 차변/대변 총액만 반환합니다.
        라인 상세 정보는 포함하지 않습니다.

        Args:
            from_date: 시작일
            to_date: 종료일
            limit: 조회 건수 제한

        Returns:
            분개 요약 목록
        """
        validate_date_range(from_date, to_date)
        return self.repo.get_summary_list(from_date, to_date, limit)

    def _validate_accounts(self, lines: list[JournalLineCreate]) -> None:
        """
        계정 유효성 검증

        - 계정이 존재하는지 확인
        - 비활성 계정은 사용 불가

        Args:
            lines: 분개 라인 목록

        Raises:
            HTTPException(400): 계정이 존재하지 않거나 비활성 상태인 경우
        """
        account_ids = {line.account_id for line in lines}

        # 계정 존재 여부 확인 (최적화: 필요한 필드만 조회)
        accounts = (
            self.db.query(Account.id, Account.is_active, Account.code, Account.name)
            .filter(Account.id.in_(account_ids))
            .all()
        )

        # 조회된 계정 ID 집합
        existing_ids = {acc.id for acc in accounts}

        # 존재하지 않는 계정 확인
        missing_ids = account_ids - existing_ids
        if missing_ids:
            raise bad_request(
                ErrorCode.ACCOUNT_NOT_FOUND,
                "사용하려는 계정이 존재하지 않습니다.",
                {"missing_account_ids": sorted(missing_ids)}
            )

        # 비활성 계정 확인
        inactive_accounts = [acc for acc in accounts if not acc.is_active]
        if inactive_accounts:
            raise bad_request(
                ErrorCode.INACTIVE_ACCOUNT,
                ErrorMessage.INACTIVE_ACCOUNT,
                {
                    "inactive_accounts": [
                        {"id": acc.id, "code": acc.code, "name": acc.name}
                        for acc in inactive_accounts
                    ]
                }
            )

    def _validate_totals(self, lines: list[JournalLineCreate]) -> None:
        """
        차변/대변 합계 검증

        복식부기 원칙에 따라 차변 합계와 대변 합계가 일치해야 합니다.

        Args:
            lines: 분개 라인 목록

        Raises:
            HTTPException(400): 차변 합계와 대변 합계가 일치하지 않는 경우
        """
        total_debit = sum(Decimal(str(line.debit)) for line in lines)
        total_credit = sum(Decimal(str(line.credit)) for line in lines)

        if total_debit != total_credit:
            raise bad_request(
                ErrorCode.DEBIT_CREDIT_MISMATCH,
                ErrorMessage.DEBIT_CREDIT_MISMATCH,
                {
                    "debit_total": int(total_debit),
                    "credit_total": int(total_credit),
                    "difference": int(total_debit - total_credit)
                }
            )
