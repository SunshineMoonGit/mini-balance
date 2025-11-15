import { getTrialBalance } from "../../../shared/api/trial-balance";
import type { TrialBalanceLine } from "../types/domain";
import type { TrialBalanceResponseDto } from "../types/dto";

export type TrialBalanceParams = {
  from: string;
  to: string;
};

const toNumber = (value: string | number) => Number(value);

const toBalanceAmount = (
  balance: TrialBalanceResponseDto["rows"][number]["opening_balance"]
) => ({
  amount: toNumber(balance.amount),
  direction: balance.direction,
});

const mapLine = (row: TrialBalanceResponseDto["rows"][number]): TrialBalanceLine => ({
  accountId: row.account_id,
  accountCode: row.account_code,
  accountName: row.account_name,
  type: row.type,
  totalDebit: toNumber(row.total_debit),
  totalCredit: toNumber(row.total_credit),
  openingBalance: toBalanceAmount(row.opening_balance),
  current: {
    debit: toNumber(row.current.debit),
    credit: toNumber(row.current.credit),
  },
  endingBalance: toBalanceAmount(row.ending_balance),
  transactionCount: row.transaction_count,
  recentEntries: row.recent_entries.map((entry) => ({
    date: entry.date,
    description: entry.description,
    debit: toNumber(entry.debit),
    credit: toNumber(entry.credit),
  })),
});

export const trialBalanceApi = {
  async fetch(params: TrialBalanceParams): Promise<{
    lines: TrialBalanceLine[];
    totals: { debit: number; credit: number; isBalanced: boolean };
    period: { from: string; to: string };
  }> {
    const response = await getTrialBalance(params);

    return {
      lines: response.rows.map(mapLine),
      totals: {
        debit: toNumber(response.total.debit),
        credit: toNumber(response.total.credit),
        isBalanced: response.total.is_balanced,
      },
      period: {
        from: response.period.from,
        to: response.period.to,
      },
    };
  },
};
