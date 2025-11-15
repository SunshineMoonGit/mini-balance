from __future__ import annotations

from decimal import Decimal
from datetime import date

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.account_repo import AccountRepository
from app.repositories.journal_repo import JournalRepository
from app.repositories.trial_balance_repo import TrialBalanceRepository
from app.schemas.general_ledger_schema import GeneralLedgerEntry, GeneralLedgerResponse
from app.schemas.trial_balance_schema import BalanceAmount, CurrentPeriod, TrialBalancePeriod


class GeneralLedgerService:
    def __init__(self, db: Session):
        self.db = db
        self.account_repo = AccountRepository(db)
        self.journal_repo = JournalRepository(db)
        self.trial_repo = TrialBalanceRepository(db)

    def _compute_balance(self, amount: Decimal, account_type: str) -> tuple[Decimal, str]:
        normal_direction = self.trial_repo.get_normal_balance_direction(account_type)
        if amount > 0:
            direction = "DEBIT"
        elif amount < 0:
            direction = "CREDIT"
        else:
            direction = normal_direction
        return (abs(amount), direction)

    def get_general_ledger(
        self,
        account_id: int,
        from_date: date,
        to_date: date,
        search: str | None = None,
    ) -> GeneralLedgerResponse:
        account = self.account_repo.get_by_id(account_id)
        if not account:
            raise HTTPException(status_code=404, detail="계정을 찾을 수 없습니다.")

        opening_totals = self.trial_repo.calculate_totals_before_period([account_id], from_date)
        opening_debit, opening_credit = opening_totals.get(account_id, (Decimal("0"), Decimal("0")))
        opening_balance_value = opening_debit - opening_credit
        opening_amount, opening_direction = self._compute_balance(opening_balance_value, account.type)

        entries = self.journal_repo.get_account_transactions(
            account_id, from_date, to_date, search
        )

        current_debit = sum(entry["debit"] for entry in entries)
        current_credit = sum(entry["credit"] for entry in entries)
        closing_balance_value = opening_balance_value + (current_debit - current_credit)
        closing_amount, closing_direction = self._compute_balance(closing_balance_value, account.type)

        running_balance = opening_balance_value
        ledger_entries: list[GeneralLedgerEntry] = []

        for entry in entries:
            running_balance += entry["debit"] - entry["credit"]
            ledger_entries.append(
                GeneralLedgerEntry(
                    entry_id=entry["entry_id"],
                    date=entry["date"],
                    description=entry["description"],
                    debit=entry["debit"],
                    credit=entry["credit"],
                    balance=Decimal(running_balance),
                )
            )

        return GeneralLedgerResponse(
            account_id=account.id,
            account_code=account.code,
            account_name=account.name,
            period=TrialBalancePeriod(from_date=from_date, to_date=to_date),
            opening_balance=BalanceAmount(amount=opening_amount, direction=opening_direction),
            current=CurrentPeriod(debit=current_debit, credit=current_credit),
            closing_balance=BalanceAmount(amount=closing_amount, direction=closing_direction),
            entries=ledger_entries,
        )
