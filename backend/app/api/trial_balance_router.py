"""
시산표(Trial Balance) API Router

시산표 조회 엔드포인트를 제공합니다.
"""
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.trial_balance_schema import TrialBalanceResponse
from app.services.trial_balance_service import TrialBalanceService


router = APIRouter(prefix="/api/v1/trial-balance", tags=["trial-balance"])


@router.get("", response_model=TrialBalanceResponse)
def get_trial_balance(
    from_date: date = Query(..., alias="from", description="시작일 (YYYY-MM-DD)"),
    to_date: date = Query(..., alias="to", description="종료일 (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    """
    시산표 조회 (B 방식: 기초 + 기중 + 기말)

    Query Parameters:
        - from: 시작일 (YYYY-MM-DD, 필수)
        - to: 종료일 (YYYY-MM-DD, 필수)

    Response:
        - period: 조회 기간
        - rows: 계정별 시산표 행
            - account_id, account_name, type
            - opening_balance: 기초 잔액 (금액 + 방향)
            - current: 기중 변동 (차변/대변 합계)
            - ending_balance: 기말 잔액 (금액 + 방향)
        - total: 합계 정보
            - debit: 차변 총합
            - credit: 대변 총합
            - is_balanced: 차변/대변 일치 여부

    Business Rules:
        - 기초 잔액 = from 이전의 모든 거래 집계
        - 기중 변동 = from ~ to 기간의 거래 집계
        - 기말 잔액 = 기초 잔액 + (기중 차변 - 기중 대변)
        - is_deleted=false인 분개만 집계에 포함
        - 잔액 방향:
            - 자산/비용: 정상 잔액 = 차변
            - 부채/자본/수익: 정상 잔액 = 대변

    Example:
        GET /api/v1/trial-balance?from=2025-01-01&to=2025-01-31
    """
    service = TrialBalanceService(db)
    return service.get_trial_balance(from_date, to_date)
