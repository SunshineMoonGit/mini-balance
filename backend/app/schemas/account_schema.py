"""
계정과목(Account) API 스키마

계정과목 CRUD API의 요청/응답 스키마를 정의합니다.
"""
from datetime import datetime as DateTime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

from app.models.account import AccountType


class AccountBase(BaseModel):
    """계정과목 기본 스키마"""
    code: str = Field(..., min_length=1, max_length=20, description="계정 코드 (예: 101, 401)")
    name: str = Field(..., min_length=1, max_length=100, description="계정명 (예: 현금, 매출)")
    type: AccountType = Field(..., description="계정 타입")
    description: str | None = Field(
        default=None,
        max_length=500,
        description="계정 설명 / 메모 (선택)",
    )


class AccountCreate(AccountBase):
    """
    계정과목 생성 요청 스키마

    Example:
        {
            "code": "520",
            "name": "접대비",
            "type": "EXPENSE"
        }
    """
    parent_id: int | None = Field(None, description="상위 계정 ID (계정 계층 구조용, 선택적)")

    class Config:
        json_schema_extra = {
            "example": {
                "code": "520",
                "name": "접대비",
                "type": "EXPENSE",
                "description": "접대 관련 비용을 기록합니다."
            }
        }


class AccountUpdate(BaseModel):
    """
    계정과목 수정 요청 스키마

    수정 가능 필드: name, type, parent_id
    code는 수정 불가 (UNIQUE 제약으로 인한 복잡성 방지)

    Example:
        {
            "name": "접대비(변경)",
            "type": "EXPENSE"
        }
    """
    name: str | None = Field(None, min_length=1, max_length=100, description="계정명")
    type: AccountType | None = Field(None, description="계정 타입")
    description: str | None = Field(
        default=None,
        max_length=500,
        description="계정 설명 / 메모"
    )
    parent_id: int | None = Field(None, description="상위 계정 ID")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "접대비(변경)",
                "type": "EXPENSE",
                "description": "설명을 변경합니다."
            }
        }

class AccountBalanceSummary(BaseModel):
    """계정 잔액 요약"""

    account_id: int
    total_debit: Decimal
    total_credit: Decimal
    balance: Decimal
    updated_at: DateTime

    model_config = ConfigDict(from_attributes=True)


class AccountRead(AccountBase):
    """
    계정과목 조회 응답 스키마

    Example:
        {
            "id": 1,
            "code": "101",
            "name": "현금",
            "type": "ASSET",
            "is_active": true,
            "parent_id": null,
            "created_at": "2025-01-01T00:00:00",
            "updated_at": "2025-01-01T00:00:00"
        }
    """
    id: int
    is_active: bool = Field(default=True, description="활성화 여부")
    parent_id: int | None = Field(None, description="상위 계정 ID")
    created_at: DateTime
    updated_at: DateTime
    balance_summary: AccountBalanceSummary | None = Field(
        default=None,
        description="계정 잔액 요약 정보",
    )

    model_config = ConfigDict(from_attributes=True)


class AccountDeactivateResponse(BaseModel):
    """
    계정과목 비활성화 응답 스키마

    Example:
        {
            "message": "Account deactivated successfully",
            "data": {
                "id": 10,
                "code": "520",
                "name": "접대비",
                "is_active": false
            }
        }
    """
    message: str
    data: dict

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Account deactivated successfully",
                "data": {
                    "id": 10,
                    "code": "520",
                    "name": "접대비",
                    "is_active": False
                }
            }
        }


class AccountStatusUpdate(BaseModel):
    activate: bool = Field(default=False, description="계정을 다시 활성화하려면 true")
