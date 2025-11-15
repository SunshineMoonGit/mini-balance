from datetime import date
from decimal import Decimal

import pytest
from fastapi import HTTPException

from app.schemas.common import ErrorCode
from app.schemas.journal_schema import JournalEntryCreate, JournalLineCreate
from app.services.journal_service import JournalService


def _build_payload(
    debit_account_id: int,
    credit_account_id: int,
    debit_amount: Decimal,
    credit_amount: Decimal,
    *,
    validate: bool = True,
):
    if validate:
        return JournalEntryCreate(
            date=date(2025, 1, 5),
            description="급여 지급",
            lines=[
                JournalLineCreate(account_id=debit_account_id, debit=debit_amount, credit=Decimal("0")),
                JournalLineCreate(account_id=credit_account_id, debit=Decimal("0"), credit=credit_amount),
            ],
        )

    return JournalEntryCreate.model_construct(
        date=date(2025, 1, 5),
        description="급여 지급",
        lines=[
            JournalLineCreate.model_construct(
                account_id=debit_account_id,
                debit=debit_amount,
                credit=Decimal("0"),
            ),
            JournalLineCreate.model_construct(
                account_id=credit_account_id,
                debit=Decimal("0"),
                credit=credit_amount,
            ),
        ],
    )


def test_create_journal_entry_success(db_session, sample_accounts):
    debit_account = sample_accounts["501"]
    credit_account = sample_accounts["101"]

    service = JournalService(db_session)
    payload = _build_payload(debit_account.id, credit_account.id, Decimal("800000"), Decimal("800000"))

    result = service.create_entry(payload)

    assert result.id is not None
    assert result.description == "급여 지급"
    assert len(result.lines) == 2
    assert result.lines[0].debit == Decimal("800000")


def test_create_journal_entry_imbalanced(db_session, sample_accounts):
    debit_account = sample_accounts["501"]
    credit_account = sample_accounts["101"]

    service = JournalService(db_session)
    payload = _build_payload(
        debit_account.id,
        credit_account.id,
        Decimal("800000"),
        Decimal("700000"),
        validate=False,
    )

    with pytest.raises(HTTPException) as exc_info:
        service.create_entry(payload)

    assert exc_info.value.detail["code"] == ErrorCode.DEBIT_CREDIT_MISMATCH


def test_create_journal_entry_inactive_account(db_session, sample_accounts):
    debit_account = sample_accounts["501"]
    credit_account = sample_accounts["101"]
    debit_account.is_active = False
    db_session.commit()

    service = JournalService(db_session)
    payload = _build_payload(debit_account.id, credit_account.id, Decimal("800000"), Decimal("800000"))

    with pytest.raises(HTTPException) as exc_info:
        service.create_entry(payload)

    assert exc_info.value.detail["code"] == ErrorCode.INACTIVE_ACCOUNT
