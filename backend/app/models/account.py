"""
계정과목(Account) 모델

복식부기 회계 시스템의 기본 단위인 계정과목을 정의합니다.
자산, 부채, 자본, 수익, 비용의 5가지 타입으로 구분됩니다.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Boolean, DateTime, String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from .account_balance import AccountBalance


class AccountType(str, Enum):
    """
    계정 타입 Enum

    - ASSET: 자산 (정상 잔액: 차변)
    - LIABILITY: 부채 (정상 잔액: 대변)
    - EQUITY: 자본 (정상 잔액: 대변)
    - REVENUE: 수익 (정상 잔액: 대변)
    - EXPENSE: 비용 (정상 잔액: 차변)
    """

    ASSET = "ASSET"
    LIABILITY = "LIABILITY"
    EQUITY = "EQUITY"
    REVENUE = "REVENUE"
    EXPENSE = "EXPENSE"


class Account(Base):
    """
    계정과목 모델

    Attributes:
        id: 계정 고유 ID (PK)
        code: 계정 코드 (예: 101, 401) - UNIQUE 제약
        name: 계정명 (예: 현금, 매출)
        type: 계정 타입 (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE)
        is_active: 활성화 여부 (기본: True) - soft delete용
        parent_id: 상위 계정 ID (계정 계층 구조 확장용, nullable)
        created_at: 생성 시간
        updated_at: 수정 시간

    Relationships:
        journal_lines: 이 계정을 사용하는 분개 라인들 (1:N)
        children: 하위 계정들 (계정 트리 구조용)
    """

    __tablename__ = "accounts"

    # 기본 필드
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    type: Mapped[AccountType] = mapped_column(String(20), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # 확장 필드 - 계정 계층 구조 (향후 사용)
    parent_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # 타임스탬프
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    journal_lines: Mapped[list["JournalLine"]] = relationship(
        "JournalLine",
        back_populates="account",
        # RESTRICT: 분개에서 사용 중인 계정은 삭제 불가
        passive_deletes="all",
    )
    balance_summary: Mapped[Optional["AccountBalance"]] = relationship(
        "AccountBalance",
        back_populates="account",
        cascade="all, delete-orphan",
        single_parent=True,
        uselist=False,
    )

    # 계정 계층 구조 (self-referential)
    children: Mapped[list["Account"]] = relationship(
        "Account", back_populates="parent", remote_side=[id]
    )
    parent: Mapped[Optional["Account"]] = relationship(
        "Account", back_populates="children", remote_side=[parent_id]
    )

    def __repr__(self) -> str:
        return f"<Account(code={self.code}, name={self.name}, type={self.type})>"
