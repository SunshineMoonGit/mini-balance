/**
 * API 타입 정의
 *
 * 백엔드 API 스키마와 일치하는 TypeScript 타입들
 */

// ============================================
// 계정과목 (Account) 타입
// ============================================

export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";

export interface AccountBalanceSummary {
  account_id: number;
  total_debit: string;
  total_credit: string;
  balance: string;
  updated_at: string;
}

export interface Account {
  id: number;
  code: string;
  name: string;
  type: AccountType;
  description?: string | null;
  balance_summary?: AccountBalanceSummary | null;
  is_active: boolean;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface AccountCreate {
  code: string;
  name: string;
  type: AccountType;
  description?: string | null;
  parent_id?: number | null;
}

export interface AccountUpdate {
  name?: string;
  type?: AccountType;
  description?: string | null;
  parent_id?: number | null;
}

export interface AccountDeactivateResponse {
  message: string;
  data: {
    id: number;
    code: string;
    name: string;
    is_active: boolean;
  };
}

// ============================================
// 분개 (Journal Entry) 타입
// ============================================

export interface JournalLine {
  id: number;
  account_id: number;
  account_name: string | null;
  debit: string;
  credit: string;
  created_at: string;
}

export interface JournalLineCreate {
  account_id: number;
  debit: number | string;
  credit: number | string;
}

export interface JournalEntry {
  id: number;
  date: string;
  description: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  lines: JournalLine[];
}

export interface JournalEntryCreate {
  date: string;
  description: string;
  lines: JournalLineCreate[];
}

export interface JournalEntryUpdate {
  date: string;
  description: string;
  lines: JournalLineCreate[];
}

export interface JournalEntryDeleteResponse {
  message: string;
  data: {
    id: number;
    is_deleted: boolean;
  };
}

// ============================================
// 시산표 (Trial Balance) 타입
// ============================================

export interface BalanceAmount {
  amount: string;
  direction: "DEBIT" | "CREDIT";
}

export interface CurrentPeriod {
  debit: string;
  credit: string;
}

export interface RecentEntry {
  date: string;
  description: string;
  debit: string;
  credit: string;
}

export interface TrialBalanceRow {
  account_id: number;
  account_code: string;
  account_name: string;
  type: AccountType;
  total_debit: string;
  total_credit: string;
  opening_balance: BalanceAmount;
  current: CurrentPeriod;
  ending_balance: BalanceAmount;
  transaction_count: number;
  recent_entries: RecentEntry[];
}

export interface TrialBalancePeriod {
  from: string;
  to: string;
}

export interface TrialBalanceTotal {
  debit: string;
  credit: string;
  is_balanced: boolean;
}

export interface TrialBalanceResponse {
  period: TrialBalancePeriod;
  rows: TrialBalanceRow[];
  total: TrialBalanceTotal;
}

export interface GeneralLedgerEntry {
  entry_id: number;
  date: string;
  description: string;
  debit: string;
  credit: string;
  balance: string;
}

export interface GeneralLedgerResponse {
  account_id: number;
  account_code: string;
  account_name: string;
  period: TrialBalancePeriod;
  opening_balance: BalanceAmount;
  current: CurrentPeriod;
  closing_balance: BalanceAmount;
  entries: GeneralLedgerEntry[];
}

// ============================================
// 에러 응답 타입
// ============================================

export interface ErrorDetail {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ErrorResponse {
  error: ErrorDetail;
}
