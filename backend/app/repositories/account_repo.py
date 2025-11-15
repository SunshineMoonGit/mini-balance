"""
계정과목(Account) Repository

데이터베이스 접근 로직을 담당합니다.
"""
from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from app.models.account import Account
from app.models.journal_line import JournalLine
from app.schemas.account_schema import AccountCreate, AccountUpdate


class AccountRepository:
    """계정과목 Repository"""

    def __init__(self, db: Session):
        self.db = db

    def list_accounts(self, include_inactive: bool = False) -> list[Account]:
        """
        계정과목 목록 조회

        Args:
            include_inactive: 비활성 계정 포함 여부 (기본: False)

        Returns:
            계정과목 목록 (code 순 정렬)
        """
        query = self.db.query(Account).options(
            selectinload(Account.balance_summary)
        )

        # 기본적으로 활성 계정만 조회
        if not include_inactive:
            query = query.filter(Account.is_active == True)

        return query.order_by(Account.code).all()

    def get_by_id(self, account_id: int) -> Account | None:
        """ID로 계정 조회"""
        return (
            self.db.query(Account)
            .options(selectinload(Account.balance_summary))
            .filter(Account.id == account_id)
            .first()
        )

    def get_by_code(self, code: str) -> Account | None:
        """계정 코드로 조회"""
        return self.db.query(Account).filter(Account.code == code).first()

    def create_account(self, payload: AccountCreate) -> Account:
        """
        계정과목 생성

        Args:
            payload: 계정 생성 데이터

        Returns:
            생성된 계정
        """
        account = Account(**payload.model_dump())
        self.db.add(account)
        self.db.flush()
        self.db.refresh(account)
        return account

    def update_account(self, account: Account, payload: AccountUpdate) -> Account:
        """
        계정과목 수정

        Args:
            account: 수정할 계정 객체
            payload: 수정 데이터

        Returns:
            수정된 계정
        """
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(account, key, value)

        self.db.flush()
        self.db.refresh(account)
        return account

    def set_account_status(self, account: Account, is_active: bool) -> Account:
        """
        계정 활성/비활성 상태 변경

        Args:
            account: 대상 계정
            is_active: True면 활성화, False면 비활성화
        """
        account.is_active = is_active
        self.db.flush()
        self.db.refresh(account)
        return account

    def is_account_in_use(self, account_id: int) -> bool:
        """
        계정이 분개에서 사용 중인지 확인

        Args:
            account_id: 계정 ID

        Returns:
            사용 중이면 True
        """
        usage_count = (
            self.db.query(func.count(JournalLine.id))
            .filter(JournalLine.account_id == account_id)
            .scalar()
        )
        return usage_count > 0

    def get_usage_count(self, account_id: int) -> int:
        """
        계정이 사용된 횟수 조회

        Args:
            account_id: 계정 ID

        Returns:
            사용 횟수
        """
        return (
            self.db.query(func.count(JournalLine.id))
            .filter(JournalLine.account_id == account_id)
            .scalar()
        )
