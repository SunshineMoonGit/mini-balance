import { Fragment } from "react";

import EmptyState from "../../../shared/components/Feedback/EmptyState";
import Skeleton from "../../../shared/components/Feedback/Skeleton";
import type {
  Account,
  AccountType,
} from "../../../features/accounts/types/domain";
import AccountDetailRow from "./AccountDetailRow";
import { formatCurrency } from "../../../shared/utils";
import { TYPE_LABELS } from "../constants";
import { getBalanceDisplay } from "../utils/balance";

type Props = {
  loading: boolean;
  accounts: Account[];
  filteredAccounts: Account[];
  selectedAccountId: number | null;
  setSelectedAccountId: (id: number | null) => void;
  usedAccountIds: Set<number>;
  handleDeactivateAccount: (account: Account) => void;
  handleActivateAccount: (account: Account) => void;
  updateAccount: (
    accountId: number,
    payload: { name?: string; type?: Account["type"]; description?: string | null }
  ) => Promise<Account>;
  isDeactivating: boolean;
  isActivating: boolean;
};

const AccountsTable = ({
  loading,
  accounts,
  filteredAccounts,
  selectedAccountId,
  setSelectedAccountId,
  usedAccountIds,
  handleDeactivateAccount,
  handleActivateAccount,
  updateAccount,
  isDeactivating,
  isActivating,
}: Props) => (
  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
    <table className="w-full text-sm">
      <thead className="bg-slate-50 text-left text-xs uppercase tracking-widest text-slate-400">
        <tr>
          <th className="px-4 py-3">코드</th>
          <th className="px-4 py-3">계정명</th>
          <th className="px-4 py-3">분류</th>
          <th className="px-4 py-3">잔액</th>
          <th className="px-4 py-3">상태</th>
        </tr>
      </thead>
      <tbody>
        {loading && (
          <tr>
            <td colSpan={5} className="px-4 py-6">
              <Skeleton count={3} height={40} />
            </td>
          </tr>
        )}
        {!loading && accounts.length === 0 && (
          <tr>
            <td colSpan={5} className="px-4 py-6">
              <EmptyState
                icon="🏦"
                title="등록된 계정이 없습니다"
                description="위의 '계정 추가' 섹션에서 새 계정을 만들어보세요"
              />
            </td>
          </tr>
        )}
        {!loading &&
          accounts.length > 0 &&
          filteredAccounts.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-6 text-center text-sm text-slate-500"
              >
                검색 또는 필터 조건에 해당하는 계정이 없습니다.
              </td>
            </tr>
          )}
        {!loading &&
          filteredAccounts.length > 0 &&
          filteredAccounts.map((account) => {
            const isSelected = account.id === selectedAccountId;
            return (
              <Fragment key={account.id}>
                <tr
                  className={`border-t transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-blue-50 border-l-4 border-l-blue-500 border-t-blue-100 shadow-sm"
                      : "border-slate-100 border-l-4 border-l-transparent hover:bg-slate-50/50 hover:border-l-slate-200"
                  }`}
                  onClick={() =>
                    setSelectedAccountId(isSelected ? null : account.id)
                  }
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <svg
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isSelected ? "rotate-90 text-blue-600" : "text-slate-400"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      <p
                        className={`font-semibold ${
                          isSelected ? "text-blue-900" : "text-slate-900"
                        }`}
                      >
                        {account.code}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p
                      className={`${
                        isSelected ? "text-blue-900 font-semibold" : "text-slate-600"
                      }`}
                    >
                      {account.name}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {(TYPE_LABELS as Record<AccountType, string>)[account.type] ??
                      account.type}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {account.balanceSummary ? (
                      (() => {
                        const balanceInfo = getBalanceDisplay(
                          account.balanceSummary?.balance ?? 0
                        );
                        const amountClass =
                          balanceInfo.directionLabel === "차변"
                            ? "text-emerald-600"
                            : balanceInfo.directionLabel === "대변"
                              ? "text-rose-600"
                              : "text-slate-600";
                        return (
                          <div className="leading-tight">
                            <p className={`font-semibold ${amountClass}`}>
                              {balanceInfo.amount === 0
                                ? "-"
                                : formatCurrency(balanceInfo.amount)}
                            </p>
                            {balanceInfo.directionLabel && (
                              <p className="text-xs text-slate-500">
                                {balanceInfo.directionLabel} 잔액
                              </p>
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        account.isActive
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {account.isActive ? "사용 중" : "비활성"}
                    </span>
                  </td>
                </tr>
                {isSelected && (
                  <AccountDetailRow
                    account={account}
                    labelMap={TYPE_LABELS}
                    onDeactivate={() => handleDeactivateAccount(account)}
                    onActivate={() => handleActivateAccount(account)}
                    onUpdateAccount={(accountId, payload) =>
                      updateAccount(accountId, payload)
                    }
                    isUsed={usedAccountIds.has(account.id)}
                    isDeactivating={isDeactivating}
                    isActivating={isActivating}
                  />
                )}
              </Fragment>
            );
          })}
      </tbody>
    </table>
  </div>
);

export default AccountsTable;
