import { useQuery } from "@tanstack/react-query";

import { trialBalanceApi, type TrialBalanceParams } from "../api/trialBalanceApi";
import type { TrialBalanceLine } from "../types/domain";

export const useTrialBalance = (params?: TrialBalanceParams) => {
  const enabled = Boolean(params?.from && params?.to);
  const query = useQuery({
    queryKey: ["trial-balance", params],
    enabled,
    queryFn: () => trialBalanceApi.fetch(params!),
  });

  return {
    data: query.data?.lines ?? ([] as TrialBalanceLine[]),
    totals: query.data?.totals ?? { debit: 0, credit: 0, isBalanced: true },
    period: query.data?.period ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
};
