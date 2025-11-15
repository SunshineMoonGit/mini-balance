"""
분개 라인(Journal Line) 모델

분개 내의 개별 행으로, 계정과목 + 차변 또는 대변 금액을 저장합니다.
복식부기 원칙에 따라 하나의 라인은 차변 또는 대변 중 하나만 값을 가집니다.
"""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class JournalLine(Base):
    """
    분개 라인 모델

    Attributes:
        id: 라인 고유 ID (PK)
        entry_id: 분개 ID (FK, ON DELETE CASCADE)
        account_id: 계정 ID (FK, ON DELETE RESTRICT - 사용 중인 계정 삭제 방지)
        debit: 차변 금액 (NUMERIC(15,0), >= 0, 정수만)
        credit: 대변 금액 (NUMERIC(15,0), >= 0, 정수만)
        created_at: 생성 시간

    Constraints:
        - CHECK: debit와 credit는 음수 불가 (>= 0)
        - CHECK: debit와 credit 중 정확히 하나만 0보다 큰 값
                 (debit > 0 이면 credit = 0, credit > 0 이면 debit = 0)

    Relationships:
        entry: 이 라인이 속한 분개 헤더
        account: 이 라인이 사용하는 계정과목

    Business Rules:
        - 한 라인은 차변 또는 대변 중 하나만 값을 가져야 함
        - 금액은 항상 0 이상
        - 한 분개의 모든 라인의 차변 합계와 대변 합계는 같아야 함 (애플리케이션 레벨에서 검증)
    """
    __tablename__ = "journal_lines"
    __table_args__ = (
        # 금액은 항상 0 이상
        CheckConstraint("debit >= 0 AND credit >= 0", name="ck_journal_line_positive"),
        # 차변 또는 대변 중 정확히 하나만 0보다 큰 값
        CheckConstraint(
            "(debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0)",
            name="ck_journal_line_single_side"
        ),
    )

    # 기본 필드
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    entry_id: Mapped[int] = mapped_column(
        ForeignKey("journal_entries.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    account_id: Mapped[int] = mapped_column(
        ForeignKey("accounts.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )

    # 금액 필드 - NUMERIC(15, 0): 최대 999,999,999,999,999 (원화는 정수 단위)
    debit: Mapped[Decimal] = mapped_column(
        Numeric(15, 0),
        default=Decimal("0"),
        nullable=False
    )
    credit: Mapped[Decimal] = mapped_column(
        Numeric(15, 0),
        default=Decimal("0"),
        nullable=False
    )

    # 타임스탬프
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    entry: Mapped["JournalEntry"] = relationship("JournalEntry", back_populates="lines")
    account: Mapped["Account"] = relationship("Account", back_populates="journal_lines")

    def __repr__(self) -> str:
        amount = self.debit if self.debit > 0 else self.credit
        side = "Dr" if self.debit > 0 else "Cr"
        return f"<JournalLine(account_id={self.account_id}, {side}: {amount})>"
