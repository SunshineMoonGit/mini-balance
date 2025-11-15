# 미니 장부 - 백엔드

복식부기 회계 시스템 REST API (FastAPI + SQLAlchemy)

## 기술 스택

- FastAPI 0.121, SQLAlchemy 2.0, Pydantic 2.12
- SQLite (개발/배포), Alembic (마이그레이션)
- Pytest 8.3

## 빠른 시작

```bash
# 1. 가상환경 및 패키지 설치
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 2. 데이터베이스 초기화
alembic upgrade head
python -m app.seed_accounts

# 3. 서버 실행
uvicorn app.main:app --reload --port 8000
```

API 문서: http://localhost:8000/api/docs

## 주요 기능

- **계정과목 관리**: 자산/부채/자본/수익/비용 계정 CRUD
- **분개 입력**: 차변=대변 검증, Soft delete
- **시산표 조회**: 기초/기중/기말 잔액 계산
- **일반원장**: 계정별 거래 내역 조회

## 프로젝트 구조

```
backend/
├── app/
│   ├── api/           # API 라우터 (엔드포인트)
│   ├── services/      # 비즈니스 로직
│   ├── repositories/  # 데이터 접근 계층
│   ├── models/        # SQLAlchemy ORM
│   ├── schemas/       # Pydantic DTO
│   └── core/          # 설정, DB, 예외 처리
├── alembic/           # 마이그레이션
└── ledger.db          # SQLite DB
```

## 데이터베이스

```bash
# 마이그레이션 상태 확인
alembic current

# 마이그레이션 실행
alembic upgrade head

# 롤백
alembic downgrade -1
```

## 테스트

```bash
pytest                              # 전체 테스트
pytest app/tests/test_journal_*.py  # 분개 테스트
pytest --cov=app                    # 커버리지
```

## API 엔드포인트

- `GET /api/accounts` - 계정 목록
- `POST /api/accounts` - 계정 생성
- `GET /api/journal-entries` - 분개 목록
- `POST /api/journal-entries` - 분개 생성
- `GET /api/trial-balance` - 시산표
- `GET /api/general-ledger/{account_id}` - 일반원장
