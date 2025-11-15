"""
분개(Journal Entry) 모델

하나의 회계 거래를 나타내는 분개 헤더입니다.
실제 차변/대변 금액은 journal_lines에 저장됩니다.
"""
from __future__ import annotations

from datetime import datetime, date
from sqlalchemy import Boolean, Date, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class JournalEntry(Base):
    """
    분개 헤더 모델

    Attributes:
        id: 분개 고유 ID (PK)
        date: 거래 발생일 (DATE 타입, NOT NULL)
        description: 적요/메모 (최대 500자)
        is_deleted: soft-delete 플래그 (기본: False)
        created_at: 생성 시간
        updated_at: 수정 시간

    Relationships:
        lines: 이 분개에 속한 분개 라인들 (1:N)
               최소 2개 이상의 라인이 있어야 하며,
               차변 합계 = 대변 합계 규칙을 만족해야 함

    Business Rules:
        - 분개는 최소 2개 이상의 라인을 가져야 함
        - 모든 라인의 차변 합계와 대변 합계가 일치해야 함
        - 삭제는 soft-delete 방식으로 처리 (is_deleted=True)
    """
    __tablename__ = "journal_entries"

    # 기본 필드
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    description: Mapped[str] = mapped_column(String(500), nullable=False, default="")

    # soft-delete 플래그
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    # 타임스탬프
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # Relationships
    lines: Mapped[list["JournalLine"]] = relationship(
        "JournalLine",
        back_populates="entry",
        cascade="all, delete-orphan",  # 분개 삭제 시 라인도 함께 삭제
        lazy="joined"  # 분개 조회 시 라인도 함께 로드
    )

    def __repr__(self) -> str:
        return f"<JournalEntry(id={self.id}, date={self.date}, description={self.description[:30]})>"
