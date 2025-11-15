from datetime import date
from decimal import Decimal
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.core.database import session_scope
from app.models import Account, JournalEntry, JournalLine
from app.seed_accounts import seed_accounts
from app.services.account_balance_service import AccountBalanceService


SAMPLE_ENTRIES = [
    # 2025년 11월 샘플 데이터
    {
        "description": "자본금 출자",
        "date": date(2025, 11, 1),
        "lines": [
            {"account_code": "101", "debit": Decimal("10000000"), "credit": Decimal("0")},
            {"account_code": "301", "debit": Decimal("0"), "credit": Decimal("10000000")},
        ],
    },
    {
        "description": "사무용품 구매",
        "date": date(2025, 11, 3),
        "lines": [
            {"account_code": "502", "debit": Decimal("500000"), "credit": Decimal("0")},
            {"account_code": "101", "debit": Decimal("0"), "credit": Decimal("500000")},
        ],
    },
    {
        "description": "현금매출 발생",
        "date": date(2025, 11, 5),
        "lines": [
            {"account_code": "101", "debit": Decimal("2500000"), "credit": Decimal("0")},
            {"account_code": "401", "debit": Decimal("0"), "credit": Decimal("2500000")},
        ],
    },
    {
        "description": "급여 지급",
        "date": date(2025, 11, 10),
        "lines": [
            {"account_code": "501", "debit": Decimal("3000000"), "credit": Decimal("0")},
            {"account_code": "101", "debit": Decimal("0"), "credit": Decimal("3000000")},
        ],
    },
    {
        "description": "임차료 지급",
        "date": date(2025, 11, 12),
        "lines": [
            {"account_code": "502", "debit": Decimal("1500000"), "credit": Decimal("0")},
            {"account_code": "101", "debit": Decimal("0"), "credit": Decimal("1500000")},
        ],
    },
    {
        "description": "상품 매입",
        "date": date(2025, 11, 14),
        "lines": [
            {"account_code": "502", "debit": Decimal("800000"), "credit": Decimal("0")},
            {"account_code": "101", "debit": Decimal("0"), "credit": Decimal("800000")},
        ],
    },
]


def seed_sample_entries():
    with session_scope() as session:
        accounts_by_code = {acc.code: acc for acc in session.query(Account).all()}
        missing_codes = {
            line["account_code"]
            for entry in SAMPLE_ENTRIES
            for line in entry["lines"]
            if line["account_code"] not in accounts_by_code
        }
        if missing_codes:
            raise RuntimeError(f"Missing accounts for codes: {', '.join(sorted(missing_codes))}")

        affected_account_ids = set()

        for entry_payload in SAMPLE_ENTRIES:
            exists = (
                session.query(JournalEntry)
                .filter(JournalEntry.description == entry_payload["description"])
                .first()
            )
            if exists:
                continue

            entry = JournalEntry(description=entry_payload["description"], date=entry_payload["date"])
            session.add(entry)
            session.flush()

            for line_payload in entry_payload["lines"]:
                account = accounts_by_code[line_payload["account_code"]]
                affected_account_ids.add(account.id)
                session.add(
                    JournalLine(
                        entry_id=entry.id,
                        account_id=account.id,
                        debit=line_payload["debit"],
                        credit=line_payload["credit"],
                    )
                )

        # 잔액 재계산
        if affected_account_ids:
            balance_service = AccountBalanceService(session)
            balance_service.recalculate_balances(affected_account_ids)


if __name__ == "__main__":
    seed_accounts()
    seed_sample_entries()
    print("Sample data seeded.")
