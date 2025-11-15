from __future__ import annotations

from decimal import Decimal as DecimalType
from datetime import date as DateType

from pydantic import BaseModel, Field

from app.schemas.trial_balance_schema import BalanceAmount, CurrentPeriod, TrialBalancePeriod


class GeneralLedgerEntry(BaseModel):
    entry_id: int = Field(..., description="전표 ID")
    date: DateType = Field(..., description="거래일")
    description: str = Field(..., description="적요")
    debit: DecimalType = Field(..., ge=0, description="차변 금액")
    credit: DecimalType = Field(..., ge=0, description="대변 금액")
    balance: DecimalType = Field(..., description="누적 잔액")


class GeneralLedgerResponse(BaseModel):
    account_id: int = Field(..., description="계정 ID")
    account_code: str = Field(..., description="계정 코드")
    account_name: str = Field(..., description="계정명")
    period: TrialBalancePeriod = Field(..., description="조회 기간")
    opening_balance: BalanceAmount = Field(..., description="기초 잔액")
    current: CurrentPeriod = Field(..., description="기중 차변/대변 합계")
    closing_balance: BalanceAmount = Field(..., description="기말 잔액")
    entries: list[GeneralLedgerEntry] = Field(..., description="계정별 원장 행")
