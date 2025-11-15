from decimal import Decimal

import pytest

from app.schemas.journal_schema import JournalEntryCreate, JournalLineCreate


def test_journal_entry_must_balance():
    line1 = JournalLineCreate(account_id=1, debit=Decimal("100"), credit=Decimal("0"))
    line2 = JournalLineCreate(account_id=2, debit=Decimal("0"), credit=Decimal("50"))
    with pytest.raises(ValueError):
        JournalEntryCreate(description="Unbalanced", lines=[line1, line2])


def test_journal_line_requires_single_side():
    with pytest.raises(ValueError):
        JournalLineCreate(account_id=1, debit=Decimal("0"), credit=Decimal("0"))


def test_journal_line_rejects_decimal_debit():
    """차변에 소수점이 있으면 거부 (원화는 정수만)"""
    with pytest.raises(ValueError, match="정수만 입력 가능"):
        JournalLineCreate(account_id=1, debit=Decimal("100.50"), credit=Decimal("0"))


def test_journal_line_rejects_decimal_credit():
    """대변에 소수점이 있으면 거부 (원화는 정수만)"""
    with pytest.raises(ValueError, match="정수만 입력 가능"):
        JournalLineCreate(account_id=1, debit=Decimal("0"), credit=Decimal("99.99"))


def test_journal_line_accepts_integer_amounts():
    """정수 금액은 허용"""
    line1 = JournalLineCreate(account_id=1, debit=Decimal("100"), credit=Decimal("0"))
    line2 = JournalLineCreate(account_id=2, debit=Decimal("0"), credit=Decimal("100"))
    assert line1.debit == Decimal("100")
    assert line2.credit == Decimal("100")


def test_journal_line_rejects_negative_amount():
    """음수 금액은 허용되지 않아야 한다"""
    with pytest.raises(ValueError):
        JournalLineCreate(account_id=1, debit=Decimal("-1"), credit=Decimal("0"))
