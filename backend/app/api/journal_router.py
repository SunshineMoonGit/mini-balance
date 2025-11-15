"""
분개(Journal Entry) API Router

분개 CRUD 엔드포인트를 제공합니다.
"""
from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.journal_schema import (
    JournalEntryCreate,
    JournalEntryRead,
    JournalEntryUpdate,
    JournalEntrySummary,
    JournalEntryDeleteResponse
)
from app.services.journal_service import JournalService


router = APIRouter(prefix="/api/v1/journal-entries", tags=["journal"])


@router.get("", response_model=list[JournalEntryRead])
def list_entries(
    from_date: date | None = Query(None, alias="from", description="시작일 (YYYY-MM-DD)"),
    to_date: date | None = Query(None, alias="to", description="종료일 (YYYY-MM-DD)"),
    limit: int = Query(default=50, ge=1, le=200, description="조회 건수 제한"),
    offset: int = Query(0, ge=0, description="페이지 오프셋"),
    db: Session = Depends(get_db)
):
    """
    분개 목록 조회

    - 날짜 범위 필터링 가능 (from, to)
    - 최신순 정렬
    - is_deleted=false인 분개만 조회
    """
    service = JournalService(db)
    return service.list_entries(from_date=from_date, to_date=to_date, limit=limit, offset=offset)


@router.get("/summary", response_model=list[JournalEntrySummary])
def list_entries_summary(
    from_date: date | None = Query(None, alias="from", description="시작일 (YYYY-MM-DD)"),
    to_date: date | None = Query(None, alias="to", description="종료일 (YYYY-MM-DD)"),
    limit: int = Query(default=50, ge=1, le=200, description="조회 건수 제한"),
    db: Session = Depends(get_db)
):
    """
    분개 목록 요약 조회

    - 차변/대변 총액만 포함한 요약 정보 반환
    - `limit`, `from`, `to` 필터를 그대로 적용
    """
    service = JournalService(db)
    return service.get_summary_list(from_date=from_date, to_date=to_date, limit=limit)


@router.get("/{entry_id}", response_model=JournalEntryRead)
def get_entry(entry_id: int, db: Session = Depends(get_db)):
    """
    분개 단건 조회

    - entry_id로 특정 분개 조회
    - 분개 라인과 계정 정보 포함
    """
    service = JournalService(db)
    return service.get_entry(entry_id)


@router.post("", response_model=JournalEntryRead, status_code=status.HTTP_201_CREATED)
def create_entry(payload: JournalEntryCreate, db: Session = Depends(get_db)):
    """
    분개 생성

    Request Body:
        - date: 거래일자 (YYYY-MM-DD, 필수)
        - description: 적요/메모 (최대 500자)
        - lines: 분개 라인 배열 (최소 2개)
            - account_id: 계정 ID
            - debit: 차변 금액 (>= 0)
            - credit: 대변 금액 (>= 0)

    Validation:
        - 최소 2개 이상의 라인 필요
        - 각 라인은 debit 또는 credit 중 하나만 입력
        - 전체 라인의 차변 합계 = 대변 합계
        - 계정이 존재해야 하며 활성 상태여야 함
    """
    service = JournalService(db)
    return service.create_entry(payload)


@router.put("/{entry_id}", response_model=JournalEntryRead)
def update_entry(
    entry_id: int,
    payload: JournalEntryUpdate,
    db: Session = Depends(get_db)
):
    """
    분개 수정

    - 생성과 동일한 검증 규칙 적용
    - 기존 라인들은 삭제되고 새 라인으로 대체됨
    """
    service = JournalService(db)
    return service.update_entry(entry_id, payload)


@router.delete("/{entry_id}", response_model=JournalEntryDeleteResponse)
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    """
    분개 삭제 (soft-delete)

    - 물리적 삭제가 아닌 is_deleted=true 처리
    - 삭제된 분개는 목록 조회 및 시산표에서 제외됨
    """
    service = JournalService(db)
    entry = service.delete_entry(entry_id)

    return JournalEntryDeleteResponse(
        message="Journal entry deleted successfully",
        data={
            "id": entry.id,
            "is_deleted": entry.is_deleted
        }
    )
