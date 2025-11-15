import { useEffect, useState } from "react";

import type {
  Account,
  AccountType,
} from "../../../features/accounts/types/domain";
import { formatCurrency, formatDateTime } from "../../../shared/utils";
import { getBalanceDisplay } from "../utils/balance";

type AccountDetailRowProps = {
  account: Account;
  labelMap: Record<AccountType, string>;
  onDeactivate?: () => void;
  onActivate?: () => void;
  onUpdateAccount?: (
    accountId: number,
    payload: { name?: string; type?: AccountType; description?: string | null }
  ) => Promise<unknown>;
  isUsed?: boolean;
  isDeactivating?: boolean;
  isActivating?: boolean;
};

const AccountDetailRow = ({
  account,
  labelMap,
  onDeactivate,
  onActivate,
  onUpdateAccount,
  isUsed,
  isDeactivating,
  isActivating,
}: AccountDetailRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: account.name,
    type: account.type,
    description: account.description ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; type?: string }>({});

  useEffect(() => {
    setDraft({
      name: account.name,
      type: account.type,
      description: account.description ?? "",
    });
    setIsEditing(false);
    setIsSaving(false);
  }, [account]);

  const handleStartEdit = () => {
    setDraft({
      name: account.name,
      type: account.type,
      description: account.description ?? "",
    });
    setErrors({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setDraft({
      name: account.name,
      type: account.type,
      description: account.description ?? "",
    });
    setErrors({});
    setIsEditing(false);
  };

  const validateFields = () => {
    const validationErrors: { name?: string; type?: string } = {};
    if (!draft.name.trim()) {
      validationErrors.name = "계정명을 입력해주세요.";
    }
    if (!draft.type) {
      validationErrors.type = "계정 분류를 선택해주세요.";
    }
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSave = async () => {
    if (!onUpdateAccount) {
      return;
    }
    if (!validateFields()) {
      return;
    }
    setIsSaving(true);
    try {
      await onUpdateAccount(account.id, {
        name: draft.name.trim(),
        type: draft.type,
        description: draft.description?.trim() ?? "",
      });
      setIsEditing(false);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "계정을 수정하지 못했습니다."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const statusLabel = account.isActive ? "사용 중" : "비활성";
  const balanceSummary = account.balanceSummary;
  const balanceDisplay = balanceSummary ? getBalanceDisplay(balanceSummary.balance) : null;
  const metadataItems = [
    {
      label: "생성 일자",
      value: account.createdAt ? formatDateTime(account.createdAt) : "—",
    },
    {
      label: "마지막 수정",
      value: account.updatedAt ? formatDateTime(account.updatedAt) : "—",
    },
  ];

  return (
    <tr>
      <td
        colSpan={5}
        className="border-t border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/50 px-6 py-6"
      >
        <div className="space-y-4">
          {/* 헤더 */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-700">
                    {account.code}
                  </span>
                  <span className="text-base font-semibold text-slate-900">
                    {account.name}
                  </span>
                </div>
                <span className="inline-block mt-1 rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {labelMap[account.type] ?? account.type}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  type="button"
                  className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                  onClick={handleStartEdit}
                >
                  편집
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "저장 중..." : "변경 저장"}
                  </button>
                </div>
              )}
              {account.isActive
                ? onDeactivate && (
                    <button
                      type="button"
                      className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400"
                      onClick={onDeactivate}
                      disabled={Boolean(isUsed) || Boolean(isDeactivating)}
                    >
                      {isDeactivating ? "비활성화 중..." : "비활성화"}
                    </button>
                  )
                : onActivate && (
                    <button
                      type="button"
                      className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
                      onClick={onActivate}
                      disabled={Boolean(isActivating)}
                    >
                      {isActivating ? "활성화 중..." : "활성화"}
                    </button>
                  )}
            </div>
          </div>

          {/* 경고 */}
          {isUsed && account.isActive && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm font-medium text-amber-700">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              분개에 사용 중인 계정은 비활성화할 수 없습니다.
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              계정 생성 시 필요한 항목
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">
              기본 정보
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-600">
                계정 코드
                <input
                  type="text"
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                  value={account.code}
                  disabled
                />
                <span className="mt-1 block text-xs text-slate-400">
                  계정 코드는 수정할 수 없습니다.
                </span>
              </label>
              <label className="text-sm font-medium text-slate-600">
                계정명
                <input
                  type="text"
                  className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 ${
                    errors.name ? "border-rose-400" : "border-slate-200"
                  } ${isEditing ? "bg-white" : "bg-slate-50"}`}
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((prev) => {
                      setErrors((prevErrors) => ({
                        ...prevErrors,
                        name: undefined,
                      }));
                      return { ...prev, name: event.target.value };
                    })
                  }
                  disabled={!isEditing || isSaving}
                />
                <span className="mt-1 block text-xs text-slate-400">
                  재무제표에 표시되는 이름입니다.
                </span>
                {errors.name && (
                  <span className="mt-1 block text-xs text-rose-500">
                    {errors.name}
                  </span>
                )}
              </label>
              <label className="text-sm font-medium text-slate-600">
                계정 분류
                <select
                  className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 ${
                    errors.type ? "border-rose-400" : "border-slate-200"
                  } ${isEditing ? "bg-white" : "bg-slate-50"}`}
                  value={draft.type}
                  onChange={(event) =>
                    setDraft((prev) => {
                      setErrors((prevErrors) => ({
                        ...prevErrors,
                        type: undefined,
                      }));
                      return {
                        ...prev,
                        type: event.target.value as AccountType,
                      };
                    })
                  }
                  disabled={!isEditing || isSaving}
                >
                  <option value="asset">자산</option>
                  <option value="liability">부채</option>
                  <option value="equity">자본</option>
                  <option value="revenue">수익</option>
                  <option value="expense">비용</option>
                </select>
                <span className="mt-1 block text-xs text-slate-400">
                  분류는 재무제표 항목과 연결됩니다.
                </span>
                {errors.type && (
                  <span className="mt-1 block text-xs text-rose-500">
                    {errors.type}
                  </span>
                )}
              </label>
              <label className="text-sm font-medium text-slate-600">
                상태
                <input
                  type="text"
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                  value={statusLabel}
                  disabled
                />
                <span className="mt-1 block text-xs text-slate-400">
                  비활성화 기능으로 상태를 조정하세요.
                </span>
              </label>
            </div>
            <label className="mt-6 block text-sm font-medium text-slate-600">
              설명 / 메모
              <textarea
                className={`mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 ${
                  isEditing ? "bg-white" : "bg-slate-50"
                }`}
                placeholder="계정에 대한 설명이나 메모를 입력하세요 (선택)"
                rows={3}
                value={draft.description}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, description: event.target.value }))
                }
                disabled={!isEditing || isSaving}
              />
            </label>
            {balanceSummary && (
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <p className="text-xs font-semibold text-emerald-600">누적 차변</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-700">
                    {formatCurrency(balanceSummary.totalDebit)}
                  </p>
                </div>
                <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-4">
                  <p className="text-xs font-semibold text-rose-600">누적 대변</p>
                  <p className="mt-1 text-lg font-semibold text-rose-700">
                    {formatCurrency(balanceSummary.totalCredit)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold text-slate-500">현재 잔액</p>
                  <p
                    className={`mt-1 text-lg font-semibold ${
                      balanceDisplay?.directionLabel === "차변"
                        ? "text-emerald-700"
                        : balanceDisplay?.directionLabel === "대변"
                          ? "text-rose-700"
                          : "text-slate-700"
                    }`}
                  >
                    {balanceDisplay && balanceDisplay.amount === 0
                      ? "-"
                      : formatCurrency(balanceDisplay?.amount ?? 0)}
                  </p>
                  {balanceDisplay?.directionLabel && (
                    <p className="text-xs text-slate-500">{balanceDisplay.directionLabel} 잔액</p>
                  )}
                  <p className="text-xs text-slate-400">
                    업데이트: {formatDateTime(balanceSummary.updatedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {metadataItems.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default AccountDetailRow;
