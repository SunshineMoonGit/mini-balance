"""
계정과목(Account) API Router

계정과목 CRUD 엔드포인트를 제공합니다.
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.account_schema import (
    AccountCreate,
    AccountRead,
    AccountUpdate,
    AccountDeactivateResponse,
    AccountStatusUpdate,
)
from app.services.account_service import AccountService


router = APIRouter(prefix="/api/v1/accounts", tags=["accounts"])


@router.get("", response_model=list[AccountRead])
def list_accounts(
    include_inactive: bool = Query(False, description="비활성 계정 포함 여부"),
    db: Session = Depends(get_db)
):
    """
    계정과목 목록 조회

    - 기본적으로 활성 계정만 조회
    - include_inactive=true 설정 시 비활성 계정 포함
    - code 순으로 정렬
    """
    service = AccountService(db)
    return service.list_accounts(include_inactive=include_inactive)


@router.get("/{account_id}", response_model=AccountRead)
def get_account(account_id: int, db: Session = Depends(get_db)):
    """
    계정과목 단건 조회

    - account_id로 특정 계정 조회
    """
    service = AccountService(db)
    return service.get_account(account_id)


@router.post("", response_model=AccountRead, status_code=status.HTTP_201_CREATED)
def create_account(payload: AccountCreate, db: Session = Depends(get_db)):
    """
    계정과목 생성

    Request Body:
        - code: 계정 코드 (unique, 필수)
        - name: 계정명 (필수)
        - type: 계정 타입 (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE)
        - parent_id: 상위 계정 ID (선택)

    Validation:
        - 계정 코드 중복 불가 (409 Conflict)
    """
    service = AccountService(db)
    return service.create_account(payload)


@router.put("/{account_id}", response_model=AccountRead)
def update_account(
    account_id: int,
    payload: AccountUpdate,
    db: Session = Depends(get_db)
):
    """
    계정과목 수정

    Request Body:
        - name: 계정명 (선택)
        - type: 계정 타입 (선택)
        - parent_id: 상위 계정 ID (선택)

    Note:
        - code는 수정 불가
        - 제공된 필드만 업데이트 (partial update)
    """
    service = AccountService(db)
    return service.update_account(account_id, payload)


@router.put("/{account_id}/status", response_model=AccountDeactivateResponse)
def update_account_status(
    account_id: int,
    payload: AccountStatusUpdate,
    db: Session = Depends(get_db),
):
    """
    계정과목 비활성화 (soft-delete)

    - 분개에서 사용 중인 계정은 비활성화 불가 (409 Conflict)
    - 물리적 삭제가 아닌 is_active=false 처리
    """
    service = AccountService(db)
    account = service.deactivate_account(account_id, activate=payload.activate)

    return AccountDeactivateResponse(
        message="Account activated successfully" if payload.activate else "Account deactivated successfully",
        data={
            "id": account.id,
            "code": account.code,
            "name": account.name,
            "is_active": account.is_active
        }
    )
