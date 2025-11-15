# API 명세서

- Base URL: `/api/v1`
- 인증/권한: 없음

---

## 1. 계정과목 (Accounts)

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| GET | `/accounts` | 계정 목록 조회 (`include_inactive`로 비활성 포함) |
| GET | `/accounts/{id}` | 계정 단건 조회 |
| POST | `/accounts` | 계정 생성 (code/name/type 필수) |
| PUT | `/accounts/{id}` | 계정 수정 (name/type/description/parent) |
| PUT | `/accounts/{id}/status` | 계정 활성/비활성 전환 (`activate` 플래그) |

- 정렬: 기본 code ASC  
- Validation: 코드 중복(409), 존재하지 않는 계정(404), 사용 중인 계정 비활성화(409)  
- 응답은 계정 기본 필드 + `balance_summary(total_debit/credit/balance, updated_at)` 간단 정보만 제공.

---

## 2. 분개 (Journal Entries)

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| GET | `/journal-entries` | 분개 목록 (기간 `from/to`, `limit/offset`) |
| GET | `/journal-entries/{id}` | 분개 상세 (라인 포함) |
| GET | `/journal-entries/summary` | 분개 요약(차/대 합계만) |
| POST | `/journal-entries` | 분개 생성 |
| PUT | `/journal-entries/{id}` | 분개 수정 |
| DELETE | `/journal-entries/{id}` | 분개 삭제 (soft delete) |

- 라인 규칙: 최소 2개, debit/credit 중 하나만 값, 음수 금지, 전체 차변=대변, 활성 계정만 사용.  
- 삭제 시 `is_deleted=true`, 집계(시산표·원장)에서 제외.  
- 요약 API는 `date/description/debit_total/credit_total`만 반환.

---

## 3. 시산표 (Trial Balance)

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| GET | `/trial-balance` | 기간별 시산표 조회 (`from`,`to` 필수) |

- 행 데이터: `account_id/code/name/type`, `opening_balance`, `current(debit/credit)`, `ending_balance`, `total_debit/credit`, `transaction_count`, `recent_entries(최대5)`  
- 합계: `total.debit/credit/is_balanced`  
- 에러: 기간 역전(400), 형식오류(422) 등.

---

## 4. 총계정원장 (General Ledger)

| 메서드 | 경로 | 요약 |
| --- | --- | --- |
| GET | `/general-ledger` | 특정 계정의 기간별 거래 흐름 |

- Query: `account_id`, `from`, `to`, `search?`.  
- 응답: 계정 정보 + `opening/current/closing` 잔액, 거래 목록(`entry_id/date/description/debit/credit/balance`).  
- 계정 미존재 시 404.
