import {
  createAccount as createAccountRequest,
  deactivateAccount as deactivateAccountRequest,
  activateAccount as activateAccountRequest,
  getAccounts,
  updateAccount as updateAccountRequest,
} from "../../../shared/api/accounts";
import type {
  Account as AccountResponse,
  AccountType as ApiAccountType,
  AccountUpdate as ApiAccountUpdate,
} from "../../../types/api";
import type { Account } from "../types/domain";

const mapAccount = (dto: AccountResponse): Account => ({
  id: dto.id,
  code: dto.code,
  name: dto.name,
  type: dto.type.toLowerCase() as Account["type"],
  description: dto.description ?? "",
  balanceSummary: dto.balance_summary
    ? {
        totalDebit: Number(dto.balance_summary.total_debit),
        totalCredit: Number(dto.balance_summary.total_credit),
        balance: Number(dto.balance_summary.balance),
        updatedAt: dto.balance_summary.updated_at,
      }
    : null,
  isActive: dto.is_active,
  parentId: dto.parent_id ?? null,
  createdAt: dto.created_at,
  updatedAt: dto.updated_at,
});

export type CreateAccountPayload = {
  code: string;
  name: string;
  type: Account["type"];
  description?: string | null;
  parentId?: number | null;
};

export const accountsApi = {
  async listAccounts(includeInactive = false): Promise<Account[]> {
    const response = await getAccounts(includeInactive);
    return response.map(mapAccount);
  },

  async createAccount(payload: CreateAccountPayload): Promise<Account> {
    const response = await createAccountRequest({
      code: payload.code,
      name: payload.name,
      type: payload.type.toUpperCase() as ApiAccountType,
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      parent_id: payload.parentId ?? null,
    });

    return mapAccount(response);
  },

  async updateAccount(
    id: number,
    payload: { name?: string; type?: Account["type"]; description?: string | null; parentId?: number | null },
  ): Promise<Account> {
    const response = await updateAccountRequest(id, {
      ...(payload.name ? { name: payload.name } : {}),
      ...(payload.type ? { type: payload.type.toUpperCase() as ApiAccountType } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      ...(payload.parentId !== undefined ? { parent_id: payload.parentId } : {}),
    } as ApiAccountUpdate);
    return mapAccount(response);
  },
  async deactivateAccount(accountId: number) {
    return deactivateAccountRequest(accountId);
  },
  async activateAccount(accountId: number) {
    return activateAccountRequest(accountId);
  },
};
