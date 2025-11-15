import type { FormEvent, Ref } from "react";

import type {
  Account,
  AccountType,
} from "../../../features/accounts/types/domain";

export type AccountFormState = {
  code: string;
  name: string;
  type: AccountType;
  description: string;
};

type AccountFormSectionProps = {
  formState: AccountFormState;
  editingAccount: Account | null;
  onChange: <K extends keyof AccountFormState>(
    field: K,
    value: AccountFormState[K],
  ) => void;
  onSubmit: () => Promise<void>;
  onReset: () => void;
  onCancelEdit: () => void;
  isSubmitting: boolean;
  formRef?: Ref<HTMLFormElement>;
  onCloseForm?: () => void;
  errors?: {
    code?: string;
    name?: string;
  };
};

const AccountFormSection = ({
  formState,
  editingAccount,
  onChange,
  onSubmit,
  onReset,
  onCancelEdit,
  isSubmitting,
  formRef,
  onCloseForm,
  errors = {},
}: AccountFormSectionProps) => {
  const isEditing = Boolean(editingAccount);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            {isEditing ? "계정 수정" : "새 계정"}
          </p>
          <h2 className="text-xl font-semibold text-slate-900">
            {isEditing ? "계정 정보 수정" : "계정 추가"}
          </h2>
        </div>
        {onCloseForm && (
          <button
            type="button"
            className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            onClick={onCloseForm}
            disabled={isSubmitting}
          >
            닫기
          </button>
        )}
      </div>

      {isEditing && editingAccount && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-700">
          <p>
            계정{" "}
            <span className="font-semibold">
              {editingAccount.code} · {editingAccount.name}
            </span>
            을(를) 수정 중입니다. 변경을 취소하려면{" "}
            <button
              type="button"
              className="font-semibold underline underline-offset-4"
              onClick={onCancelEdit}
            >
              취소
            </button>{" "}
            를 눌러주세요.
          </p>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col text-sm font-medium text-slate-700">
            계정 코드 *
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className={`mt-2 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${
                errors.code
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500"
                  : "border-slate-300 bg-white focus:border-blue-500 focus:ring-blue-500"
              }`}
              placeholder="예: 101"
              value={formState.code}
              onChange={(event) => {
                const value = event.target.value;
                // 숫자만 허용
                if (value === "" || /^\d+$/.test(value)) {
                  onChange("code", value);
                }
              }}
              disabled={isEditing || isSubmitting}
            />
            {isEditing ? (
              <span className="mt-1 text-xs text-slate-500">
                계정 코드는 수정할 수 없습니다
              </span>
            ) : errors.code ? (
              <span className="mt-1 text-xs text-rose-500">{errors.code}</span>
            ) : null}
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-700">
            계정명 *
            <input
              type="text"
              className={`mt-2 rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                errors.name
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              }`}
              placeholder="예: 현금"
              value={formState.name}
              onChange={(event) => onChange("name", event.target.value)}
              disabled={isSubmitting}
            />
            {errors.name && (
              <span className="mt-1 text-xs text-rose-500">{errors.name}</span>
            )}
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-700">
            분류 *
            <select
              className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formState.type}
              onChange={(event) =>
                onChange("type", event.target.value as AccountType)
              }
              disabled={isSubmitting}
            >
              <option value="asset">자산</option>
              <option value="liability">부채</option>
              <option value="equity">자본</option>
              <option value="revenue">수익</option>
              <option value="expense">비용</option>
            </select>
          </label>
        </div>

        <div>
          <label className="flex flex-col text-sm font-medium text-slate-700">
            설명 / 메모
            <textarea
              className="mt-2 resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="계정에 대한 설명이나 메모를 입력하세요 (선택사항)"
              rows={3}
              value={formState.description}
              onChange={(event) => onChange("description", event.target.value)}
              disabled={isSubmitting}
            />
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onReset}
            disabled={isSubmitting}
          >
            초기화
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEditing
                ? "수정 중..."
                : "등록 중..."
              : isEditing
              ? "변경 저장"
              : "계정 추가"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountFormSection;
