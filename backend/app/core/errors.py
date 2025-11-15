"""
공통 HTTP 오류 생성 헬퍼
"""
from typing import Any

from fastapi import HTTPException
from starlette import status

from app.schemas.common import ErrorCode


def build_error(
    code: ErrorCode,
    message: str,
    status_code: int = status.HTTP_400_BAD_REQUEST,
    details: dict[str, Any] | None = None,
) -> HTTPException:
    return HTTPException(
        status_code=status_code,
        detail={
            "code": code,
            "message": message,
            "details": details or {},
        },
    )


def not_found(code: ErrorCode, message: str, details: dict[str, Any] | None = None) -> HTTPException:
    return build_error(code, message, status.HTTP_404_NOT_FOUND, details)


def conflict(code: ErrorCode, message: str, details: dict[str, Any] | None = None) -> HTTPException:
    return build_error(code, message, status.HTTP_409_CONFLICT, details)
