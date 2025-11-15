import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { accountsApi, type CreateAccountPayload } from "../api/accountsApi";
import type { Account } from "../types/domain";

type UpdateAccountPayload = {
  id: number;
  payload: {
    name?: string;
    type?: Account["type"];
    description?: string | null;
  };
};

type UseAccountsOptions = {
  includeInactive?: boolean;
};

export const useAccounts = ({ includeInactive = false }: UseAccountsOptions = {}) => {
  const queryClient = useQueryClient();
  const query = useQuery<Account[], Error>({
    queryKey: ["accounts", includeInactive],
    queryFn: () => accountsApi.listAccounts(includeInactive),
  });

  const createAccountMutation = useMutation({
    mutationFn: (payload: CreateAccountPayload) => accountsApi.createAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: ({ id, payload }: UpdateAccountPayload) => accountsApi.updateAccount(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const deactivateAccountMutation = useMutation({
    mutationFn: (accountId: number) => accountsApi.deactivateAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const activateAccountMutation = useMutation({
    mutationFn: (accountId: number) => accountsApi.activateAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
    createAccount: createAccountMutation.mutateAsync,
    updateAccount: (
      id: number,
      payload: { name?: string; type?: Account["type"]; description?: string | null },
    ) => updateAccountMutation.mutateAsync({ id, payload }),
    deactivateAccount: deactivateAccountMutation.mutateAsync,
    activateAccount: activateAccountMutation.mutateAsync,
    isDeactivating: deactivateAccountMutation.isPending,
    isActivating: activateAccountMutation.isPending,
  };
};
