import type { Account } from "../../../features/accounts/types/domain";
import type { FieldErrors } from "react-hook-form";

export type JournalLineState = {
  accountId: number;
  debit: number;
  credit: number;
};

type Props = {
  lines: JournalLineState[];
  onChange: (index: number, field: keyof JournalLineState, value: string) => void;
  onRemoveLine: (index: number) => void;
  onAddLine: () => void;
  accounts: Account[];
  totals: { debit: number; credit: number };
  errors?: FieldErrors<JournalLineState>[];
};

const formatAmount = (value: number) => {
  if (value === undefined || value === null) {
    return "—";
  }
  return `₩ ${value.toLocaleString()}`;
};

const JournalLinesTable = ({
  lines,
  onChange,
  onRemoveLine,
  onAddLine,
  accounts,
  totals,
  errors = [],
}: Props) => (
  <div className="overflow-hidden rounded-2xl border border-slate-100">
    <table className="w-full text-sm">
      <thead className="bg-slate-50 text-left text-xs uppercase tracking-widest text-slate-400">
        <tr>
          <th className="px-4 py-3">계정과목</th>
          <th className="px-4 py-3">차변</th>
          <th className="px-4 py-3">대변</th>
          <th className="px-4 py-3 text-right">동작</th>
        </tr>
      </thead>
      <tbody>
        {lines.map((line, index) => {
          const fieldErrors = errors?.[index];
          return (
            <tr key={index} className="border-t border-slate-100">
              <td className="px-4 py-3">
                <select
                  className={`w-full rounded-lg border p-2 text-sm ${
                    fieldErrors?.accountId ? "border-rose-500" : "border-slate-200"
                  }`}
                  value={line.accountId}
                  onChange={(event) => onChange(index, "accountId", event.target.value)}
                >
                  <option value={0}>계정 선택</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.code} · {account.name}
                    </option>
                  ))}
                </select>
                {fieldErrors?.accountId?.message && (
                  <p className="mt-1 text-[11px] text-rose-500">{fieldErrors.accountId.message}</p>
                )}
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  inputMode="numeric"
                  className={`w-full rounded-lg border p-2 text-sm ${
                    fieldErrors?.debit ? "border-rose-500" : "border-slate-200"
                  }`}
                  value={line.debit ? line.debit.toLocaleString() : ""}
                  onChange={(event) => {
                    const value = event.target.value.replace(/,/g, "");
                    // 빈 값이거나 숫자만 허용 (소수점 없음)
                    if (value === "" || /^\d+$/.test(value)) {
                      onChange(index, "debit", value);
                    }
                  }}
                  placeholder="0"
                />
                {fieldErrors?.debit?.message && (
                  <p className="mt-1 text-[11px] text-rose-500">{fieldErrors.debit.message}</p>
                )}
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  inputMode="numeric"
                  className={`w-full rounded-lg border p-2 text-sm ${
                    fieldErrors?.credit ? "border-rose-500" : "border-slate-200"
                  }`}
                  value={line.credit ? line.credit.toLocaleString() : ""}
                  onChange={(event) => {
                    const value = event.target.value.replace(/,/g, "");
                    // 빈 값이거나 숫자만 허용 (소수점 없음)
                    if (value === "" || /^\d+$/.test(value)) {
                      onChange(index, "credit", value);
                    }
                  }}
                  placeholder="0"
                />
                {fieldErrors?.credit?.message && (
                  <p className="mt-1 text-[11px] text-rose-500">{fieldErrors.credit.message}</p>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 transition hover:border-rose-400 hover:text-rose-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                  onClick={() => onRemoveLine(index)}
                  disabled={lines.length <= 2}
                  aria-label="분개 라인 삭제"
                >
                  삭제
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
      <tfoot className="bg-slate-50 text-sm font-semibold">
        <tr>
          <td className="px-4 py-3 text-right text-slate-700">합계</td>
          <td className="px-4 py-3 text-emerald-600">{formatAmount(totals.debit)}</td>
          <td className="px-4 py-3 text-rose-600">{formatAmount(totals.credit)}</td>
          <td className="px-4 py-3" />
        </tr>
      </tfoot>
    </table>
    <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3">
      <button
        type="button"
        onClick={onAddLine}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
      >
        + 라인 추가
      </button>
    </div>
  </div>
);

export default JournalLinesTable;
