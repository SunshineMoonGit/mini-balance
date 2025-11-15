export type BalanceDirection = "DEBIT" | "CREDIT";

export type BalanceAmount = {
  amount: number;
  direction: BalanceDirection;
};

export type CurrentPeriod = {
  debit: number;
  credit: number;
};

export type RecentEntry = {
  date: string;
  description: string;
  debit: number;
  credit: number;
};

export type TrialBalanceLine = {
  accountId: number;
  accountCode: string;
  accountName: string;
  type: string;
  totalDebit: number;
  totalCredit: number;
  openingBalance: BalanceAmount;
  current: CurrentPeriod;
  endingBalance: BalanceAmount;
  transactionCount: number;
  recentEntries: RecentEntry[];
};
