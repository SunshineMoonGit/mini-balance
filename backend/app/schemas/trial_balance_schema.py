"""
시산표(Trial Balance) API 스키마

기초 잔액 + 기중 변동 + 기말 잔액 방식(B 방식)의 시산표 스키마를 정의합니다.
"""
from datetime import date as Date
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

from app.models.account import AccountType


class BalanceAmount(BaseModel):
    """
    잔액 금액 스키마

    Attributes:
        amount: 금액 (절대값)
        direction: 방향 ("DEBIT" 또는 "CREDIT")
    """
    amount: Decimal = Field(..., ge=0, description="잔액 금액")
    direction: str = Field(..., pattern="^(DEBIT|CREDIT)$", description="잔액 방향")

    class Config:
        json_schema_extra = {
            "example": {
                "amount": 1000000,
                "direction": "DEBIT"
            }
        }


class CurrentPeriod(BaseModel):
    """
    기중 변동 금액 스키마

    Attributes:
        debit: 기중 차변 합계
        credit: 기중 대변 합계
    """
    debit: Decimal = Field(..., ge=0, description="기중 차변 합계")
    credit: Decimal = Field(..., ge=0, description="기중 대변 합계")

    class Config:
        json_schema_extra = {
            "example": {
                "debit": 550000,
                "credit": 800000
            }
        }


class RecentEntry(BaseModel):
    """최근 거래 내역"""
    date: str = Field(..., description="거래일")
    description: str = Field(..., description="적요")
    debit: Decimal = Field(..., ge=0, description="차변")
    credit: Decimal = Field(..., ge=0, description="대변")


class TrialBalanceRow(BaseModel):
    """
    시산표 행 스키마 (계정별)

    합계 시산표: 차변 합계 + 대변 합계 + 잔액

    Example:
        {
            "account_id": 101,
            "account_code": "101",
            "account_name": "현금",
            "type": "ASSET",
            "total_debit": 5000000,
            "total_credit": 2000000,
            "balance": {"amount": 3000000, "direction": "DEBIT"},
            "transaction_count": 15,
            "recent_entries": [...]
        }
    """
    account_id: int = Field(..., description="계정 ID")
    account_code: str = Field(..., description="계정 코드")
    account_name: str = Field(..., description="계정명")
    type: AccountType = Field(..., description="계정 타입")

    total_debit: Decimal = Field(..., ge=0, description="차변 합계")
    total_credit: Decimal = Field(..., ge=0, description="대변 합계")
    opening_balance: BalanceAmount = Field(..., description="기초 잔액")
    current: CurrentPeriod = Field(..., description="기중 변동")
    ending_balance: BalanceAmount = Field(..., description="기말 잔액")

    transaction_count: int = Field(..., ge=0, description="거래 건수")
    recent_entries: list[RecentEntry] = Field(default_factory=list, description="최근 거래 내역")

    model_config = ConfigDict(from_attributes=True)


class TrialBalancePeriod(BaseModel):
    """
    시산표 조회 기간

    Attributes:
        from_date: 시작일 (YYYY-MM-DD)
        to_date: 종료일 (YYYY-MM-DD)
    """
    from_date: Date = Field(..., alias="from", description="시작일")
    to_date: Date = Field(..., alias="to", description="종료일")

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "from": "2025-01-01",
                "to": "2025-01-31"
            }
        }


class TrialBalanceTotal(BaseModel):
    """
    시산표 합계 정보

    Attributes:
        debit: 차변 총합
        credit: 대변 총합
        is_balanced: 차변/대변 일치 여부
    """
    debit: Decimal = Field(..., ge=0, description="차변 총합")
    credit: Decimal = Field(..., ge=0, description="대변 총합")
    is_balanced: bool = Field(..., description="차변/대변 일치 여부")

    class Config:
        json_schema_extra = {
            "example": {
                "debit": 3550000,
                "credit": 3550000,
                "is_balanced": True
            }
        }


class TrialBalanceResponse(BaseModel):
    """
    시산표 조회 응답 스키마

    Example:
        {
            "period": {"from": "2025-01-01", "to": "2025-01-31"},
            "rows": [...],
            "total": {
                "debit": 3550000,
                "credit": 3550000,
                "is_balanced": true
            }
        }
    """
    period: TrialBalancePeriod = Field(..., description="조회 기간")
    rows: list[TrialBalanceRow] = Field(..., description="계정별 시산표 행")
    total: TrialBalanceTotal = Field(..., description="합계 정보")

    class Config:
        json_schema_extra = {
            "example": {
                "period": {
                    "from": "2025-01-01",
                    "to": "2025-01-31"
                },
                "rows": [
                    {
                        "account_id": 101,
                        "account_code": "101",
                        "account_name": "현금",
                        "type": "ASSET",
                        "opening_balance": {
                            "amount": 3000000,
                            "direction": "DEBIT"
                        },
                        "current": {
                            "debit": 550000,
                            "credit": 800000
                        },
                        "ending_balance": {
                            "amount": 2750000,
                            "direction": "DEBIT"
                        }
                    }
                ],
                "total": {
                    "debit": 3550000,
                    "credit": 3550000,
                    "is_balanced": True
                }
            }
        }
