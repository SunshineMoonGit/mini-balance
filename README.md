<div align="center">
  <h1>📒 미니 장부</h1>
  <p>복식부기 회계 시스템 (Double-Entry Bookkeeping System)</p>
</div>

<br/>

<div align="center">

[![Demo](https://img.shields.io/badge/Demo-Live-success?style=for-the-badge&logo=vercel&logoColor=white)](http://localhost:5173)
&nbsp;
[![API Docs](https://img.shields.io/badge/API_Docs-Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=white)](http://localhost:8000/api/docs)

</div>

---

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [빠른 시작](#-빠른-시작)
- [프로젝트 구조](#-프로젝트-구조)
- [개발 가이드](#-개발-가이드)

---

## 🎯 프로젝트 소개

개인 및 소규모 사업자를 위한 웹 기반 회계 관리 시스템입니다.  
복식부기 원칙에 따른 **분개 입력부터 시산표 조회**까지 기본적인 회계 업무를 지원합니다.

### 프로젝트 배경

기존 회계 소프트웨어는 복잡하고 비싸며, 소규모 사업자에게는 과도한 기능을 제공합니다.  
본 프로젝트는 다음 문제를 해결하고자 합니다:

- ❌ 복잡한 UI와 높은 학습 곡선
- ❌ 고가의 라이선스 비용
- ❌ 불필요한 기능들로 인한 복잡성

✅ **미니 장부**는 **핵심 회계 기능만 제공**하여 누구나 쉽게 사용할 수 있는 회계 시스템을 목표로 합니다.

---

## 주요 기능

### 1. 계정과목 관리
- 자산, 부채, 자본, 수익, 비용 계정 CRUD
- 계정별 잔액 조회 (기초/기말 잔액)
- 활성/비활성 계정 구분

### 2. 분개 입력
- 복식부기 원칙 준수 (차변=대변 검증)
- 날짜별 분개 조회 및 관리
- Soft delete 방식으로 안전한 데이터 관리

### 3. 시산표
- 기간별 시산표 조회
- 기초/기중/기말 잔액 계산
- PDF 내보내기 기능

### 4. 일반원장
- 계정별 거래 내역 조회
- 기간별 필터링
- 상세 거래 내역 확인

### 5. 대시보드
- 회계 현황 요약
- 주요 지표 시각화
- 최근 거래 내역

---

## 📸 스크린샷

### 대시보드
![대시보드](assets/dashboard.JPG)

### 분개 입력
![분개 입력](assets/journal.JPG)

### 분개 상세
![분개 상세](assets/journal-1.JPG)

### 계정과목 관리
![계정과목](assets/accounts.JPG)

### 계정과목 상세
![계정과목 상세](assets/accounts-1.JPG)

### 시산표
![시산표](assets/trial-balance.JPG)

### 일반원장
![일반원장](assets/general-ledger.JPG)

---

## 기술 스택

<table>
  <thead>
    <tr>
      <th>분류</th>
      <th>기술 스택</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>프론트엔드</b></td>
      <td>
        <img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=white"/>
        <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white"/>
        <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white"/>
      </td>
    </tr>
    <tr>
      <td><b>백엔드</b></td>
      <td>
        <img src="https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white"/>
        <img src="https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white"/>
        <img src="https://img.shields.io/badge/Alembic-000000?style=flat&logo=alembic&logoColor=white"/>
      </td>
    </tr>
    <tr>
      <td><b>데이터베이스</b></td>
      <td>
        <img src="https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white"/>
      </td>
    </tr>
  </tbody>
</table>

---

## 빠른 시작


### 1. 저장소 클론

```bash
git clone <repository-url>
cd dotco
```

### 2. 백엔드 실행

```bash
cd backend

# 가상환경 생성 및 활성화
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 패키지 설치
pip install -r requirements.txt

# 환경변수 설정
cp .env.example .env
# 또는 직접 .env 파일 생성 (아래 환경변수 설정 참고)

# 데이터베이스 마이그레이션 적용
alembic upgrade head

# 초기 데이터 추가 (기본 계정과목)
python -m app.seed_accounts

# (선택) 샘플 데이터 추가 (테스트용 분개 데이터)
python -m app.seed_sample_data

# 개발 서버 실행 (포트 8000)
uvicorn app.main:app --reload
```

**API 문서**: http://localhost:8000/api/docs

#### 환경변수 설정

`backend/.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
APP_NAME=Mini Ledger
ENVIRONMENT=local
DATABASE_URL=sqlite:///./ledger.db
DB_ECHO=0
AUTO_CREATE_TABLES=0
```

**환경변수 설명:**
- `APP_NAME`: 애플리케이션 이름
- `ENVIRONMENT`: 실행 환경 (local, development, production)
- `DATABASE_URL`: 데이터베이스 연결 URL
- `DB_ECHO`: SQL 쿼리 로그 출력 여부 (0: 비활성화, 1: 활성화)
- `AUTO_CREATE_TABLES`: 테이블 자동 생성 여부 (0: 비활성화, 1: 활성화)

#### 초기 데이터 설명
- `seed_accounts`: 기본 계정과목 생성 (자산, 부채, 자본, 수익, 비용)
- `seed_sample_data`: 테스트용 분개 데이터 생성 (선택사항)

### 3. 프론트엔드 실행

```bash
cd frontend

# 패키지 설치
npm install

# 개발 서버 실행 (포트 5173)
npm run dev
```

**애플리케이션**: http://localhost:5173

---

## 📁 프로젝트 구조

```
dotco/
├── backend/                 # FastAPI 백엔드
│   ├── app/
│   │   ├── api/            # API 라우터 (엔드포인트)
│   │   ├── services/       # 비즈니스 로직
│   │   ├── repositories/   # 데이터 접근 계층
│   │   ├── models/         # SQLAlchemy ORM 모델
│   │   ├── schemas/        # Pydantic DTO
│   │   ├── core/           # 설정, DB, 예외 처리
│   │   └── tests/          # 테스트 코드
│   ├── alembic/            # 데이터베이스 마이그레이션
│   ├── requirements.txt    # Python 패키지 의존성
│   └── ledger.db           # SQLite 데이터베이스
│
└── frontend/                # React 프론트엔드
    ├── src/
    │   ├── features/       # 기능별 모듈 (Feature-Sliced)
    │   │   ├── journal/    # 분개
    │   │   ├── trialBalance/ # 시산표
    │   │   ├── generalLedger/ # 일반원장
    │   │   ├── accounts/   # 계정과목
    │   │   └── dashboard/  # 대시보드
    │   ├── pages/          # 페이지 컴포넌트
    │   ├── routes/         # 라우팅 설정
    │   ├── app/            # 앱 설정 (QueryProvider 등)
    │   └── types/          # 타입 정의
    └── package.json
```