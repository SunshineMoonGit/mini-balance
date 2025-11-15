"""
공통 예외 처리 및 에러 생성 헬퍼

일관된 에러 응답을 생성하고 트랜잭션 관리를 단순화합니다.
"""
from typing import Any, Callable, TypeVar
from functools import wraps

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.schemas.common import ErrorCode, ErrorMessage

T = TypeVar('T')


def build_error(
    code: str,
    message: str,
    status_code: int = status.HTTP_400_BAD_REQUEST,
    details: dict[str, Any] | None = None,
) -> HTTPException:
    """
    표준 HTTP 에러 응답 생성

    Args:
        code: 에러 코드
        message: 에러 메시지
        status_code: HTTP 상태 코드
        details: 추가 상세 정보

    Returns:
        HTTPException 인스턴스
    """
    return HTTPException(
        status_code=status_code,
        detail={
            "code": code,
            "message": message,
            "details": details or {},
        },
    )


def not_found(
    code: str,
    message: str,
    details: dict[str, Any] | None = None
) -> HTTPException:
    """404 Not Found 에러 생성"""
    return build_error(code, message, status.HTTP_404_NOT_FOUND, details)


def conflict(
    code: str,
    message: str,
    details: dict[str, Any] | None = None
) -> HTTPException:
    """409 Conflict 에러 생성"""
    return build_error(code, message, status.HTTP_409_CONFLICT, details)


def bad_request(
    code: str,
    message: str,
    details: dict[str, Any] | None = None
) -> HTTPException:
    """400 Bad Request 에러 생성"""
    return build_error(code, message, status.HTTP_400_BAD_REQUEST, details)


def unprocessable_entity(
    code: str,
    message: str,
    details: dict[str, Any] | None = None
) -> HTTPException:
    """422 Unprocessable Entity 에러 생성"""
    return build_error(code, message, status.HTTP_422_UNPROCESSABLE_ENTITY, details)


def internal_error(
    message: str = ErrorMessage.INTERNAL_ERROR,
    details: dict[str, Any] | None = None
) -> HTTPException:
    """500 Internal Server Error 에러 생성"""
    return build_error(
        ErrorCode.INTERNAL_ERROR,
        message,
        status.HTTP_500_INTERNAL_SERVER_ERROR,
        details
    )


def with_transaction(func: Callable[..., T]) -> Callable[..., T]:
    """
    트랜잭션 관리 데코레이터

    서비스 메서드에 적용하여 자동으로 commit/rollback을 처리합니다.

    사용 예:
        @with_transaction
        def create_entry(self, payload):
            # DB 작업
            return result
    """
    @wraps(func)
    def wrapper(self, *args, **kwargs):
        db: Session = self.db
        try:
            result = func(self, *args, **kwargs)
            db.commit()
            return result
        except HTTPException:
            db.rollback()
            raise
        except IntegrityError as e:
            db.rollback()
            # 제약 조건 위반 - 일반적으로 중복 키
            raise conflict(
                ErrorCode.CONFLICT,
                "데이터 무결성 위반이 발생했습니다.",
                {"error": str(e.orig) if hasattr(e, 'orig') else str(e)}
            )
        except SQLAlchemyError as e:
            db.rollback()
            raise internal_error(
                ErrorMessage.DATABASE_ERROR,
                {"error": str(e)}
            )
        except Exception as e:
            db.rollback()
            raise internal_error(
                ErrorMessage.INTERNAL_ERROR,
                {"error": str(e)}
            )

    return wrapper


def validate_date_range(from_date, to_date) -> None:
    """
    날짜 범위 검증

    Args:
        from_date: 시작일
        to_date: 종료일

    Raises:
        HTTPException(422): 날짜 범위가 유효하지 않은 경우
    """
    if from_date and to_date and from_date > to_date:
        raise unprocessable_entity(
            ErrorCode.INVALID_DATE_RANGE,
            ErrorMessage.INVALID_DATE_RANGE,
            {"from": str(from_date), "to": str(to_date)}
        )
