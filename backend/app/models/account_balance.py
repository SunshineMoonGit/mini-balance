"""
계정 잔액(Account Balance) 모델

계정별 총 차변/대변 및 잔액 요약 정보를 저장합니다.
"""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from .account import Account


class AccountBalance(Base):
    """계정 잔액 요약 테이블"""

    __tablename__ = "account_balances"

    account_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("accounts.id", ondelete="CASCADE"),
        primary_key=True,
    )
    total_debit: Mapped[Decimal] = mapped_column(
        Numeric(15, 0),
        default=Decimal("0"),
        nullable=False,
    )
    total_credit: Mapped[Decimal] = mapped_column(
        Numeric(15, 0),
        default=Decimal("0"),
        nullable=False,
    )
    balance: Mapped[Decimal] = mapped_column(
        Numeric(15, 0),
        default=Decimal("0"),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    account: Mapped["Account"] = relationship(
        "Account",
        back_populates="balance_summary",
    )

    def __repr__(self) -> str:
        return (
            f"<AccountBalance(account_id={self.account_id}, "
            f"debit={self.total_debit}, credit={self.total_credit}, balance={self.balance})>"
        )
