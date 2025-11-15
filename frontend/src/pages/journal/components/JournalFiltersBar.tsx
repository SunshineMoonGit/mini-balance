import type { ChangeEvent } from "react";
import DatePicker from "../../../shared/components/DatePicker";

type Props = {
  periodFilters: { from: string; to: string };
  searchTerm: string;
  onPeriodChange: (field: "from" | "to", value: string) => void;
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onResetPage?: () => void;
};

const JournalFiltersBar = ({
  periodFilters,
  searchTerm,
  onPeriodChange,
  onSearchChange,
  onResetPage,
}: Props) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <label className="flex flex-col text-sm font-medium text-slate-600">
        시작일
        <div className="mt-2">
          <DatePicker
            value={periodFilters.from}
            onChange={(date) => {
              onPeriodChange("from", date);
              onResetPage?.();
            }}
            className="h-12"
          />
        </div>
      </label>
      <label className="flex flex-col text-sm font-medium text-slate-600">
        종료일
        <div className="mt-2">
          <DatePicker
            value={periodFilters.to}
            onChange={(date) => {
              onPeriodChange("to", date);
              onResetPage?.();
            }}
            className="h-12"
          />
        </div>
      </label>
      <label className="flex flex-col text-sm font-medium text-slate-600">
        키워드 검색
        <input
          type="text"
          className="mt-2 rounded-xl border border-slate-200 p-3 text-sm"
          placeholder="임차료, 급여 등"
          value={searchTerm}
          onChange={(e) => {
            onSearchChange(e);
            onResetPage?.();
          }}
        />
      </label>
    </div>
  );
};

export default JournalFiltersBar;
