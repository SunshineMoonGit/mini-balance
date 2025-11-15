"""
계정과목(Account) Service

비즈니스 로직을 담당합니다.
"""
from sqlalchemy.orm import Session

from app.repositories.account_repo import AccountRepository
from app.schemas.account_schema import AccountCreate, AccountUpdate
from app.schemas.common import ErrorCode, ErrorMessage
from app.core.exceptions import conflict, not_found, with_transaction, bad_request
from app.services.account_balance_service import AccountBalanceService


class AccountService:
    """
    계정과목 서비스

    계정과목의 CRUD 및 활성화/비활성화를 담당합니다.
    """

    def __init__(self, db: Session):
        """
        Args:
            db: 데이터베이스 세션
        """
        self.db = db
        self.repo = AccountRepository(db)
        self.balance_service = AccountBalanceService(db)

    def list_accounts(self, include_inactive: bool = False):
        """
        계정과목 목록 조회

        Args:
            include_inactive: 비활성 계정 포함 여부

        Returns:
            계정과목 목록
        """
        return self.repo.list_accounts(include_inactive=include_inactive)

    def get_account(self, account_id: int):
        """
        계정과목 단건 조회

        Args:
            account_id: 계정 ID

        Returns:
            계정 객체

        Raises:
            HTTPException(404): 계정을 찾을 수 없는 경우
        """
        account = self.repo.get_by_id(account_id)
        if not account:
            raise not_found(
                ErrorCode.ACCOUNT_NOT_FOUND,
                ErrorMessage.ACCOUNT_NOT_FOUND,
                {"account_id": account_id},
            )
        return account

    @with_transaction
    def create_account(self, payload: AccountCreate):
        """
        계정과목 생성

        Args:
            payload: 계정 생성 데이터

        Returns:
            생성된 계정

        Raises:
            HTTPException(409): 계정 코드가 중복된 경우
        """
        # 계정 코드 중복 확인
        existing = self.repo.get_by_code(payload.code)
        if existing:
            raise conflict(
                ErrorCode.DUPLICATE_CODE,
                ErrorMessage.DUPLICATE_CODE,
                {"code": payload.code},
            )

        # 계정 생성 및 초기 잔액 설정
        account = self.repo.create_account(payload)
        self.balance_service.recalculate_balances({account.id})

        return account

    @with_transaction
    def update_account(self, account_id: int, payload: AccountUpdate):
        """
        계정과목 수정

        Args:
            account_id: 계정 ID
            payload: 수정 데이터

        Returns:
            수정된 계정

        Raises:
            HTTPException(404): 계정을 찾을 수 없는 경우
        """
        account = self.get_account(account_id)
        return self.repo.update_account(account, payload)

    @with_transaction
    def deactivate_account(self, account_id: int, activate: bool = False):
        """
        계정과목 비활성화/재활성화 (soft-delete)

        사용 중인 계정은 비활성화할 수 없습니다.

        Args:
            account_id: 계정 ID
            activate: True일 경우 다시 활성화

        Returns:
            비활성화/활성화된 계정

        Raises:
            HTTPException(404): 계정을 찾을 수 없는 경우
            HTTPException(409): 계정이 사용 중인 경우 (비활성화 시도 시)
        """
        account = self.get_account(account_id)

        # 비활성화 시도 시 사용 중인지 확인
        if not activate and self.repo.is_account_in_use(account_id):
            usage_count = self.repo.get_usage_count(account_id)
            raise conflict(
                ErrorCode.ACCOUNT_IN_USE,
                ErrorMessage.ACCOUNT_IN_USE,
                {
                    "account_id": account_id,
                    "usage_count": usage_count
                }
            )

        target_status = activate  # True면 활성화, False면 비활성화
        return self.repo.set_account_status(account, target_status)
