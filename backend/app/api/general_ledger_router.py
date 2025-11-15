from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.general_ledger_schema import GeneralLedgerResponse
from app.services.general_ledger_service import GeneralLedgerService

router = APIRouter(prefix="/api/v1/general-ledger", tags=["general-ledger"])


@router.get("", response_model=GeneralLedgerResponse)
def get_general_ledger(
    account_id: int = Query(..., alias="account_id", description="조회할 계정 ID"),
    from_date: date = Query(..., alias="from", description="시작일 (YYYY-MM-DD)"),
    to_date: date = Query(..., alias="to", description="종료일 (YYYY-MM-DD)"),
    search: str | None = Query(None, description="전표 ID 또는 적요 검색"),
    db: Session = Depends(get_db),
):
    service = GeneralLedgerService(db)
    return service.get_general_ledger(account_id, from_date, to_date, search)
