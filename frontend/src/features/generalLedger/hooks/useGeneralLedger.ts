import { useQuery } from "@tanstack/react-query";

import { getGeneralLedger, type GeneralLedgerParams } from "../api/generalLedgerApi";
import type { GeneralLedgerResponse } from "../../../types/api";

export const useGeneralLedger = (params: GeneralLedgerParams) => {
  const enabled = Boolean(params.account_id && params.from && params.to);
  return useQuery<GeneralLedgerResponse, Error>({
    queryKey: ["general-ledger", params.account_id, params.from, params.to, params.search],
    enabled,
    queryFn: () => getGeneralLedger(params),
  });
};
