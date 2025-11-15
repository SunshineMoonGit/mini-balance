# 미니 장부 - 프론트엔드

복식부기 회계 시스템 웹 애플리케이션 (React + TypeScript)

## 기술 스택

- React 19, TypeScript 5.9, Vite 7
- TanStack Query (React Query), React Router 7
- React Hook Form + Zod (폼 관리 및 검증)
- Tailwind CSS 4 (스타일링)
- jsPDF (PDF 내보내기)

## 빠른 시작

```bash
# 1. 패키지 설치
npm install

# 2. 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:5173 접속

## 주요 기능

- **계정과목 관리**: 계정 조회, 생성, 수정, 비활성화
- **분개 입력**: 복식부기 분개 생성 및 관리 (차변=대변 검증)
- **시산표**: 기간별 시산표 조회 및 PDF 내보내기
- **일반원장**: 계정별 거래 내역 조회
- **대시보드**: 회계 현황 요약

## 프로젝트 구조

```
frontend/
├── src/
│   ├── features/         # 기능별 모듈
│   │   ├── journal/      # 분개
│   │   ├── trialBalance/ # 시산표
│   │   ├── generalLedger/ # 일반원장
│   │   ├── accounts/     # 계정과목
│   │   └── dashboard/    # 대시보드
│   ├── pages/            # 페이지 컴포넌트
│   ├── routes/           # 라우팅
│   ├── app/              # 앱 설정 (QueryProvider 등)
│   └── types/            # 타입 정의
└── vite.config.ts
```

## 아키텍처

### Feature-Sliced 구조

각 기능(feature)은 독립적인 모듈로 구성:

```
features/journal/
├── api/           # API 호출 함수
├── hooks/         # React Query hooks
├── types/         # DTO, Domain 타입
├── validation.ts  # Zod 스키마
└── constants.ts   # 상수
```

### 상태 관리

- **서버 상태**: TanStack Query (캐싱, 자동 갱신)
- **폼 상태**: React Hook Form + Zod
- **라우팅 상태**: React Router

## 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 린트 검사
npm run lint
```

빌드 결과물은 `dist/` 디렉토리에 생성됩니다.

## 주요 페이지

- `/` - 대시보드
- `/accounts` - 계정과목 관리
- `/journal` - 분개 입력
- `/trial-balance` - 시산표
- `/general-ledger/:accountId` - 일반원장

## 환경 설정

API 서버 주소는 각 feature의 `api/` 파일에서 설정 가능합니다.
기본값: `http://localhost:8000`
