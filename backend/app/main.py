"""
미니 장부(복식부기) & 시산표 - Main Application

FastAPI 기반 회계 시스템 백엔드 애플리케이션
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401  # 모델 메타데이터 로드용
from app.api import account_router, general_ledger_router, journal_router, trial_balance_router
from app.core.config import get_settings
from app.core.database import Base, engine

settings = get_settings()

# FastAPI 애플리케이션 초기화
app = FastAPI(
    title="미니 장부 API",
    description="""
    ## 복식부기 회계 시스템 API

    ### 주요 기능
    * **계정과목 관리**: 자산, 부채, 자본, 수익, 비용 계정 CRUD
    * **분개 입력**: 복식부기 원칙(차변=대변)을 준수하는 분개 관리
    * **시산표 조회**: 기초 잔액 + 기중 변동 + 기말 잔액 방식(B 방식)

    ### 설계 원칙
    * 차변 합계 = 대변 합계 검증
    * Soft-delete 방식 (is_active, is_deleted)
    * 표준화된 에러 응답
    * 확장 가능한 구조 (일반원장, 결산 등)
    """,
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    """
    애플리케이션 시작 시 실행

    - auto_create_tables=True인 경우 자동으로 테이블 생성
    """
    if settings.auto_create_tables:
        print("📊 데이터베이스 테이블 자동 생성 중...")
        Base.metadata.create_all(bind=engine)
        print("✅ 테이블 생성 완료")


@app.get("/", tags=["health"])
def root():
    """루트 엔드포인트"""
    return {
        "message": "미니 장부 API에 오신 것을 환영합니다!",
        "docs": "/api/docs",
        "version": "1.0.0"
    }


@app.get("/health", tags=["health"])
def health():
    """헬스 체크 엔드포인트"""
    return {"status": "ok"}


# API 라우터 등록
app.include_router(account_router.router)
app.include_router(journal_router.router)
app.include_router(general_ledger_router.router)
app.include_router(trial_balance_router.router)

print("=" * 60)
print("🚀 미니 장부 API 서버가 시작되었습니다!")
print("📖 API 문서: http://localhost:8000/api/docs")
print("📊 ReDoc: http://localhost:8000/api/redoc")
print("=" * 60)
