"""
Trial Balance 관련 데이터 타입
"""
from dataclasses import dataclass
from decimal import Decimal

from app.models.account import AccountType


@dataclass
class RecentEntryRecord:
    date: str
    description: str
    debit: Decimal
    credit: Decimal


@dataclass
class TrialBalanceEntry:
    account_id: int
    account_code: str
    account_name: str
    type: AccountType
    total_debit: Decimal
    total_credit: Decimal
    balance: Decimal
    transaction_count: int
    recent_entries: list[RecentEntryRecord]
