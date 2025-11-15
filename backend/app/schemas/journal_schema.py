"""
분개(Journal Entry) API 스키마

분개 및 분개 라인 CRUD API의 요청/응답 스키마를 정의합니다.
"""
from __future__ import annotations

from datetime import date as Date, datetime as DateTime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class JournalLineBase(BaseModel):
    """분개 라인 기본 스키마 (원화는 정수 단위)"""
    account_id: int = Field(..., gt=0, description="계정 ID")
    debit: Decimal = Field(default=Decimal("0"), ge=0, description="차변 금액 (정수)")
    credit: Decimal = Field(default=Decimal("0"), ge=0, description="대변 금액 (정수)")


class JournalLineCreate(JournalLineBase):
    """
    분개 라인 생성 요청 스키마

    Validation Rules:
        - debit, credit >= 0 (음수 불가)
        - debit > 0 이면 credit = 0, credit > 0 이면 debit = 0 (둘 중 하나만)

    Example:
        {"account_id": 501, "debit": 800000, "credit": 0}
    """

    @field_validator("debit", "credit")
    @classmethod
    def validate_amount(cls, v: Decimal) -> Decimal:
        """금액은 0 이상의 정수여야 함 (원화는 소수점 없음)"""
        if v < 0:
            raise ValueError("금액은 0 이상이어야 합니다.")
        if v % 1 != 0:
            raise ValueError("금액은 정수만 입력 가능합니다 (원화는 소수점이 없습니다).")
        return v

    @model_validator(mode="after")
    def validate_single_side(self) -> "JournalLineCreate":
        """차변 또는 대변 중 정확히 하나만 값이 있어야 함"""
        if (self.debit == 0 and self.credit == 0) or (self.debit > 0 and self.credit > 0):
            raise ValueError("차변 또는 대변 중 하나만 값을 입력해야 합니다.")
        return self


class JournalLineRead(JournalLineBase):
    """
    분개 라인 조회 응답 스키마

    계정명(account_name)도 함께 반환합니다.

    Example:
        {
            "id": 10,
            "account_id": 501,
            "account_name": "급여",
            "debit": 800000,
            "credit": 0
        }
    """
    id: int
    account_name: str | None = Field(None, description="계정명 (조회용)")
    created_at: DateTime

    model_config = ConfigDict(from_attributes=True)


class JournalEntryBase(BaseModel):
    """분개 기본 스키마"""
    date: Date = Field(..., description="거래 발생일 (YYYY-MM-DD)")
    description: str = Field(default="", max_length=500, description="적요/메모")


class JournalEntryCreate(JournalEntryBase):
    """
    분개 생성 요청 스키마

    Validation Rules:
        - 최소 2개 이상의 라인 필요
        - 전체 라인의 차변 합계 = 대변 합계

    Example:
        {
            "date": "2025-01-05",
            "description": "급여 지급",
            "lines": [
                {"account_id": 501, "debit": 800000, "credit": 0},
                {"account_id": 101, "debit": 0, "credit": 800000}
            ]
        }
    """
    lines: list[JournalLineCreate] = Field(..., min_length=2, description="분개 라인 (최소 2개)")

    @model_validator(mode="after")
    def validate_balanced(self) -> "JournalEntryCreate":
        """차변 합계와 대변 합계가 일치하는지 검증"""
        total_debit = sum(line.debit for line in self.lines)
        total_credit = sum(line.credit for line in self.lines)

        if total_debit != total_credit:
            raise ValueError(
                f"차변/대변 금액이 일치하지 않습니다. "
                f"(차변: {total_debit}, 대변: {total_credit})"
            )
        return self

    class Config:
        json_schema_extra = {
            "example": {
                "date": "2025-01-05",
                "description": "급여 지급",
                "lines": [
                    {"account_id": 501, "debit": 800000, "credit": 0},
                    {"account_id": 101, "debit": 0, "credit": 800000}
                ]
            }
        }


class JournalEntryUpdate(JournalEntryBase):
    """
    분개 수정 요청 스키마

    생성과 동일한 검증 규칙이 적용됩니다.
    """
    lines: list[JournalLineCreate] = Field(..., min_length=2, description="분개 라인 (최소 2개)")

    @model_validator(mode="after")
    def validate_balanced(self) -> "JournalEntryUpdate":
        """차변 합계와 대변 합계가 일치하는지 검증"""
        total_debit = sum(line.debit for line in self.lines)
        total_credit = sum(line.credit for line in self.lines)

        if total_debit != total_credit:
            raise ValueError(
                f"차변/대변 금액이 일치하지 않습니다. "
                f"(차변: {total_debit}, 대변: {total_credit})"
            )
        return self


class JournalEntryRead(JournalEntryBase):
    """
    분개 조회 응답 스키마

    Example:
        {
            "id": 3,
            "date": "2025-01-05",
            "description": "급여 지급",
            "is_deleted": false,
            "created_at": "2025-01-05T10:00:00",
            "updated_at": "2025-01-05T10:00:00",
            "lines": [...]
        }
    """
    id: int
    is_deleted: bool = Field(default=False, description="삭제 여부")
    created_at: DateTime
    updated_at: DateTime
    lines: list[JournalLineRead]

    model_config = ConfigDict(from_attributes=True)


class JournalEntrySummary(JournalEntryBase):
    """
    분개 목록 조회용 요약 스키마

    라인 상세 정보 대신 차변/대변 총액만 포함합니다.

    Example:
        {
            "id": 3,
            "date": "2025-01-05",
            "description": "급여 지급",
            "debit_total": 800000,
            "credit_total": 800000
        }
    """
    id: int
    debit_total: Decimal = Field(..., description="차변 총액")
    credit_total: Decimal = Field(..., description="대변 총액")

    model_config = ConfigDict(from_attributes=True)


class JournalEntryDeleteResponse(BaseModel):
    """
    분개 삭제 응답 스키마

    Example:
        {
            "message": "Journal entry deleted successfully",
            "data": {"id": 3, "is_deleted": true}
        }
    """
    message: str
    data: dict

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Journal entry deleted successfully",
                "data": {"id": 3, "is_deleted": True}
            }
        }
