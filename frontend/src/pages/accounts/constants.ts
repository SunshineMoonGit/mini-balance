import type { AccountType } from "../../features/accounts/types/domain";

export const TYPE_LABELS: Record<AccountType, string> = {
  asset: "자산",
  liability: "부채",
  equity: "자본",
  revenue: "수익",
  expense: "비용",
};
