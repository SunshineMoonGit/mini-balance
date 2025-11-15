export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

export type Account = {
  id: number;
  code: string;
  name: string;
  type: AccountType;
  description?: string | null;
  balanceSummary?: AccountBalanceSummary | null;
  isActive: boolean;
  parentId?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AccountBalanceSummary = {
  totalDebit: number;
  totalCredit: number;
  balance: number;
  updatedAt: string;
};

export type AccountStatus = "사용" | "검토";
