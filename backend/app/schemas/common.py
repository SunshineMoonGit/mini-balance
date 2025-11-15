"""
공통 스키마 정의

API 응답의 일관성을 위한 공통 스키마들을 정의합니다.
"""
from typing import Any, Generic, TypeVar
from pydantic import BaseModel, Field


# 제네릭 타입 변수
T = TypeVar('T')


class ErrorDetail(BaseModel):
    """
    에러 상세 정보 스키마

    Attributes:
        code: 에러 코드 (예: VALIDATION_ERROR, RESOURCE_NOT_FOUND)
        message: 사용자에게 표시할 메시지
        details: 추가 상세 정보 (선택적)
    """
    code: str = Field(..., description="에러 코드")
    message: str = Field(..., description="에러 메시지")
    details: dict[str, Any] | None = Field(None, description="추가 상세 정보")

    class Config:
        json_schema_extra = {
            "example": {
                "code": "VALIDATION_ERROR",
                "message": "차변/대변 금액이 일치하지 않습니다.",
                "details": {
                    "debit_total": 800000,
                    "credit_total": 900000,
                    "difference": -100000
                }
            }
        }


class ErrorResponse(BaseModel):
    """
    에러 응답 스키마

    모든 에러 응답은 이 형식을 따릅니다.
    """
    error: ErrorDetail

    class Config:
        json_schema_extra = {
            "example": {
                "error": {
                    "code": "RESOURCE_NOT_FOUND",
                    "message": "Account not found",
                    "details": {
                        "resource": "Account",
                        "id": 999
                    }
                }
            }
        }


class SuccessResponse(BaseModel, Generic[T]):
    """
    성공 응답 스키마 (선택적)

    일관성을 위해 사용할 수 있는 래퍼 스키마입니다.
    단순 조회(GET)의 경우 data만 직접 반환 가능합니다.

    Attributes:
        data: 실제 응답 데이터
        message: 성공 메시지 (선택적)
    """
    data: T
    message: str | None = Field(None, description="성공 메시지")


class PaginationMeta(BaseModel):
    """
    페이징 메타 정보 (확장 요구사항)

    Attributes:
        page: 현재 페이지 번호
        limit: 페이지당 항목 수
        total_count: 전체 항목 수
        total_pages: 전체 페이지 수
    """
    page: int = Field(..., ge=1, description="현재 페이지 번호")
    limit: int = Field(..., ge=1, le=100, description="페이지당 항목 수")
    total_count: int = Field(..., ge=0, description="전체 항목 수")
    total_pages: int = Field(..., ge=0, description="전체 페이지 수")

    class Config:
        json_schema_extra = {
            "example": {
                "page": 1,
                "limit": 20,
                "total_count": 150,
                "total_pages": 8
            }
        }


class PaginatedResponse(BaseModel, Generic[T]):
    """
    페이징 응답 스키마 (확장 요구사항)

    Attributes:
        data: 응답 데이터 리스트
        pagination: 페이징 메타 정보
    """
    data: list[T]
    pagination: PaginationMeta


# 에러 코드 상수
class ErrorCode:
    """
    표준 에러 코드 정의

    HTTP Status와 매핑되는 에러 코드들입니다.
    """
    # 400 Bad Request
    VALIDATION_ERROR = "VALIDATION_ERROR"
    DEBIT_CREDIT_MISMATCH = "DEBIT_CREDIT_MISMATCH"
    INVALID_AMOUNT = "INVALID_AMOUNT"
    INACTIVE_ACCOUNT = "INACTIVE_ACCOUNT"
    INSUFFICIENT_LINES = "INSUFFICIENT_LINES"

    # 404 Not Found
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND"
    ACCOUNT_NOT_FOUND = "ACCOUNT_NOT_FOUND"
    JOURNAL_ENTRY_NOT_FOUND = "JOURNAL_ENTRY_NOT_FOUND"

    # 409 Conflict
    CONFLICT = "CONFLICT"
    DUPLICATE_CODE = "DUPLICATE_CODE"
    ACCOUNT_IN_USE = "ACCOUNT_IN_USE"

    # 422 Unprocessable Entity
    INVALID_FORMAT = "INVALID_FORMAT"
    INVALID_DATE_FORMAT = "INVALID_DATE_FORMAT"
    INVALID_DATE_RANGE = "INVALID_DATE_RANGE"

    # 500 Internal Server Error
    INTERNAL_ERROR = "INTERNAL_ERROR"
    DATABASE_ERROR = "DATABASE_ERROR"


# 에러 메시지 템플릿
class ErrorMessage:
    """
    표준 에러 메시지 템플릿
    """
    # 검증 오류
    DEBIT_CREDIT_MISMATCH = "차변/대변 금액이 일치하지 않습니다."
    INVALID_AMOUNT = "금액은 0 이상이어야 합니다."
    INACTIVE_ACCOUNT = "비활성화된 계정은 사용할 수 없습니다."
    INSUFFICIENT_LINES = "분개는 최소 2개 이상의 라인이 필요합니다."

    # 리소스 없음
    ACCOUNT_NOT_FOUND = "계정을 찾을 수 없습니다."
    JOURNAL_ENTRY_NOT_FOUND = "분개를 찾을 수 없습니다."

    # 충돌
    DUPLICATE_CODE = "이미 사용 중인 계정 코드입니다."
    ACCOUNT_IN_USE = "이미 분개에서 사용 중인 계정은 삭제할 수 없습니다."

    # 형식 오류
    INVALID_DATE_FORMAT = "날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)"
    INVALID_DATE_RANGE = "시작 날짜는 종료 날짜보다 이전이어야 합니다."

    # 서버 오류
    INTERNAL_ERROR = "서버 오류가 발생했습니다. 관리자에게 문의하세요."
