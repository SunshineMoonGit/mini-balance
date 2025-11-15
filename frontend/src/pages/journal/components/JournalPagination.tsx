import type { ChangeEvent } from "react";

type Props = {
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  pageSizeOptions: readonly number[];
  onPrevPage: () => void;
  onNextPage: () => void;
  onPageSizeChange: (event: ChangeEvent<HTMLSelectElement>) => void;
};

const JournalPagination = ({
  currentPage,
  pageSize,
  hasNextPage,
  pageSizeOptions,
  onPrevPage,
  onNextPage,
  onPageSizeChange,
}: Props) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-6 py-3 text-sm text-slate-600">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-700 disabled:border-slate-100 disabled:text-slate-300"
          onClick={onPrevPage}
          disabled={currentPage === 1}
        >
          이전
        </button>
        <button
          type="button"
          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-700 disabled:border-slate-100 disabled:text-slate-300"
          onClick={onNextPage}
          disabled={!hasNextPage}
        >
          다음
        </button>
        <span className="text-xs text-slate-500">페이지 {currentPage}</span>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500">페이지당</label>
        <select
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs"
          value={pageSize}
          onChange={onPageSizeChange}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}개
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default JournalPagination;
