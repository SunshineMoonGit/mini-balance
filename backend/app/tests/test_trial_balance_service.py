from datetime import date
from decimal import Decimal

from app.models.journal_entry import JournalEntry
from app.models.journal_line import JournalLine
from app.services.trial_balance_service import TrialBalanceService


def _to_decimal(value: int | str | Decimal) -> Decimal:
    if isinstance(value, Decimal):
        return value
    return Decimal(str(value))


def _create_entry(db_session, entry_date: date, description: str, lines: list[dict]):
    entry = JournalEntry(date=entry_date, description=description)
    db_session.add(entry)
    db_session.flush()

    for line in lines:
        db_session.add(
            JournalLine(
                entry_id=entry.id,
                account_id=line["account_id"],
                debit=_to_decimal(line.get("debit", 0)),
                credit=_to_decimal(line.get("credit", 0)),
            )
        )

    db_session.commit()


def test_trial_balance_sample_entries(db_session, sample_accounts):
    """샘플 분개 3건 기준 Trial Balance 집계가 기대값과 일치하는지 검증"""
    cash = sample_accounts["101"]
    capital = sample_accounts["301"]
    revenue = sample_accounts["401"]
    salary = sample_accounts["501"]

    # 1) 자본금 출자 (현금 / 자본금)
    _create_entry(
        db_session,
        date(2025, 1, 2),
        "자본금 출자",
        [
            {"account_id": cash.id, "debit": Decimal("3000000"), "credit": Decimal("0")},
            {"account_id": capital.id, "debit": Decimal("0"), "credit": Decimal("3000000")},
        ],
    )

    # 2) 현금 매출
    _create_entry(
        db_session,
        date(2025, 1, 3),
        "현금매출 발생",
        [
            {"account_id": cash.id, "debit": Decimal("550000"), "credit": Decimal("0")},
            {"account_id": revenue.id, "debit": Decimal("0"), "credit": Decimal("550000")},
        ],
    )

    # 3) 급여 지급
    _create_entry(
        db_session,
        date(2025, 1, 5),
        "급여 지급",
        [
            {"account_id": salary.id, "debit": Decimal("800000"), "credit": Decimal("0")},
            {"account_id": cash.id, "debit": Decimal("0"), "credit": Decimal("800000")},
        ],
    )

    service = TrialBalanceService(db_session)
    result = service.get_trial_balance(date(2025, 1, 1), date(2025, 1, 31))
    rows_by_code = {row.account_code: row for row in result.rows}

    cash_row = rows_by_code["101"]
    assert cash_row.total_debit == Decimal("3550000")
    assert cash_row.total_credit == Decimal("800000")
    assert cash_row.balance.amount == Decimal("2750000")
    assert cash_row.balance.direction == "DEBIT"

    revenue_row = rows_by_code["401"]
    assert revenue_row.total_credit == Decimal("550000")
    assert revenue_row.balance.direction == "CREDIT"
    assert revenue_row.balance.amount == Decimal("550000")

    salary_row = rows_by_code["501"]
    assert salary_row.total_debit == Decimal("800000")
    assert salary_row.balance.direction == "DEBIT"

    capital_row = rows_by_code["301"]
    assert capital_row.total_credit == Decimal("3000000")
    assert capital_row.balance.direction == "CREDIT"

    # Checking account(102)는 거래가 없으므로 0 잔액이어야 함
    assert rows_by_code["102"].total_debit == Decimal("0")
    assert rows_by_code["102"].total_credit == Decimal("0")

    assert result.total.debit == Decimal("3550000")
    assert result.total.credit == Decimal("3550000")
    assert result.total.is_balanced is True
