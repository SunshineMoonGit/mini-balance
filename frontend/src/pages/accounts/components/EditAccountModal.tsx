import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import type { Account, AccountType } from "../../../features/accounts/types/domain";

type EditAccountModalProps = {
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { id: number; name: string; type: AccountType }) => Promise<unknown>;
};

const ACCOUNT_TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: "asset", label: "자산" },
  { value: "liability", label: "부채" },
  { value: "equity", label: "자본" },
  { value: "revenue", label: "수익" },
  { value: "expense", label: "비용" },
];

const EditAccountModal = ({ account, isOpen, onClose, onSubmit }: EditAccountModalProps) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>(ACCOUNT_TYPE_OPTIONS[0].value);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && account) {
      setName(account.name);
      setType(account.type);
      setError(null);
    }
  }, [isOpen, account]);

  if (!isOpen || !account) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ id: account.id, name: name.trim(), type });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-account-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">계정 관리</p>
            <h3 className="text-lg font-semibold text-slate-900" id="edit-account-modal-title">
              {account.name} 수정
            </h3>
          </div>
          <button className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500" onClick={onClose}>
            닫기
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="account-name">
              계정명
            </label>
            <input
              id="account-name"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="account-type">
              계정 분류
            </label>
            <select
              id="account-type"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={type}
              onChange={(event) => setType(event.target.value as AccountType)}
            >
              {ACCOUNT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600" onClick={onClose} disabled={submitting}>
              취소
            </button>
            <button
              type="submit"
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              disabled={submitting || !name.trim()}
            >
              {submitting ? "저장 중..." : "변경 저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAccountModal;
