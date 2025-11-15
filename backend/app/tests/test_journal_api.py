from decimal import Decimal

from datetime import date

def _entry_payload(debit_account_id: int, credit_account_id: int, date_str: str = "2025-01-05") -> dict:
    return {
        "date": date_str,
        "description": "급여 지급",
        "lines": [
            {"account_id": debit_account_id, "debit": 800000, "credit": 0},
            {"account_id": credit_account_id, "debit": 0, "credit": 800000},
        ],
    }


def test_create_journal_entry_api(client, sample_accounts):
    debit_account = sample_accounts["501"]
    credit_account = sample_accounts["101"]

    response = client.post(
        "/api/v1/journal-entries",
        json=_entry_payload(debit_account.id, credit_account.id),
    )

    assert response.status_code == 201
    data = response.json()
    assert data["description"] == "급여 지급"
    assert len(data["lines"]) == 2
    assert Decimal(data["lines"][0]["debit"]) == Decimal("800000.00")


def test_create_journal_entry_api_validation_error(client, sample_accounts):
    debit_account = sample_accounts["501"]
    credit_account = sample_accounts["101"]

    response = client.post(
        "/api/v1/journal-entries",
        json={
            "date": "2025-01-05",
            "description": "불균형 분개",
            "lines": [
                {"account_id": debit_account.id, "debit": 800000, "credit": 0},
                {"account_id": credit_account.id, "debit": 0, "credit": 700000},
            ],
        },
    )

    assert response.status_code == 422
    data = response.json()
    errors = data["detail"]
    assert isinstance(errors, list)
    assert any("차변/대변" in err.get("msg", "") for err in errors)


def test_list_journal_entries_with_filters(client, sample_accounts):
    debit_account = sample_accounts["501"]
    credit_account = sample_accounts["101"]

    client.post(
        "/api/v1/journal-entries",
        json=_entry_payload(debit_account.id, credit_account.id, date_str="2025-01-10"),
    )

    response = client.get(
        "/api/v1/journal-entries",
        params={"from": "2025-01-01", "to": "2025-01-31"},
    )

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1


def test_journal_entries_summary_endpoint(client, sample_accounts):
    debit_account = sample_accounts["501"]
    credit_account = sample_accounts["101"]

    client.post(
        "/api/v1/journal-entries",
        json=_entry_payload(debit_account.id, credit_account.id, date_str="2025-01-12"),
    )

    response = client.get(
        "/api/v1/journal-entries/summary",
        params={"from": "2025-01-01", "to": "2025-01-31"},
    )

    assert response.status_code == 200
    summary = response.json()
    assert isinstance(summary, list)
    assert Decimal(summary[0]["debit_total"]) == Decimal("800000.00")
    assert Decimal(summary[0]["credit_total"]) == Decimal("800000.00")


def test_journal_entries_pagination_offset(client, sample_accounts):
    debit_account = sample_accounts["501"]
    credit_account = sample_accounts["101"]

    for posted in ["2025-01-15", "2025-01-14", "2025-01-13"]:
        client.post(
            "/api/v1/journal-entries",
            json=_entry_payload(debit_account.id, credit_account.id, date_str=posted),
        )

    response = client.get(
        "/api/v1/journal-entries",
        params={"limit": 1, "offset": 1},
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["date"].startswith("2025-01-14")
