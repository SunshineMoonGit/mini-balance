import type { GeneralLedgerResponse } from "../../../types/api";
import { apiClient } from "../../../shared/api/client";

export type GeneralLedgerParams = {
  account_id: number;
  from: string;
  to: string;
  search?: string;
};

export const getGeneralLedger = async (params: GeneralLedgerParams): Promise<GeneralLedgerResponse> => {
  const searchParams = new URLSearchParams({
    account_id: params.account_id.toString(),
    from: params.from,
    to: params.to,
  });

  if (params.search) {
    searchParams.append("search", params.search);
  }

  return apiClient.get<GeneralLedgerResponse>(`/v1/general-ledger?${searchParams.toString()}`);
};

