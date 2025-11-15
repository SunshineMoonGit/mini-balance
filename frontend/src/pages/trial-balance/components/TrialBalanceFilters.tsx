import DatePicker from "../../../shared/components/DatePicker";

import type {
  AccountTypeOption,
  DirectionFilter,
  SortKey,
  TrialBalancePeriod,
} from "../hooks/useTrialBalanceFilters";

type Props = {
  formFilters: TrialBalancePeriod;
  onDateChange: (field: keyof TrialBalancePeriod, value: string) => void;
  activeFilters: string[];
  accountTypeFilter: AccountTypeOption;
  directionFilter: DirectionFilter;
  onlyMovements: boolean;
  showZeroBalance: boolean;
  searchTerm: string;
  sortKey: SortKey;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  onAccountTypeChange: (value: AccountTypeOption) => void;
  onDirectionChange: (value: DirectionFilter) => void;
  onToggleZeroBalance: (value: boolean) => void;
  onToggleOnlyMovements: (value: boolean) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortKey) => void;
};

const TrialBalanceFilters = ({
  formFilters,
  onDateChange,
  activeFilters,
  accountTypeFilter,
  directionFilter,
  onlyMovements,
  showZeroBalance,
  searchTerm,
  sortKey,
  onApplyFilters,
  onResetFilters,
  onAccountTypeChange,
  onDirectionChange,
  onToggleZeroBalance,
  onToggleOnlyMovements,
  onSearchChange,
  onSortChange,
}: Props) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-6">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">기간 설정</p>
        <h2 className="text-xl font-semibold text-slate-900">시산표 필터</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600"
          onClick={onResetFilters}
          aria-label="필터 초기화"
        >
          초기화
        </button>
        <button
          type="button"
          className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          onClick={onApplyFilters}
          aria-label="시산표 조회"
        >
          조회
        </button>
      </div>
    </div>

    <div className="grid gap-4 md:grid-cols-4">
      <label className="flex flex-col text-sm font-medium text-slate-600">
        시작일
        <div className="mt-2">
          <DatePicker
            value={formFilters.from}
            onChange={(date: string) => onDateChange("from", date)}
            className="h-12"
          />
        </div>
      </label>
      <label className="flex flex-col text-sm font-medium text-slate-600">
        종료일
        <div className="mt-2">
          <DatePicker
            value={formFilters.to}
            onChange={(date: string) => onDateChange("to", date)}
            className="h-12"
          />
        </div>
      </label>
      <label className="flex flex-col text-sm font-medium text-slate-600">
        분류
        <select
          className="mt-2 h-12 rounded-xl border border-slate-200 px-3 text-sm"
          value={accountTypeFilter}
          onChange={(event) =>
            onAccountTypeChange(event.target.value as AccountTypeOption)
          }
        >
          <option value="ALL">전체</option>
          <option value="ASSET">자산</option>
          <option value="LIABILITY">부채</option>
          <option value="EQUITY">자본</option>
          <option value="REVENUE">수익</option>
          <option value="EXPENSE">비용</option>
        </select>
      </label>
      <label className="flex flex-col text-sm font-medium text-slate-600">
        잔액 방향
        <select
          className="mt-2 h-12 rounded-xl border border-slate-200 px-3 text-sm"
          value={directionFilter}
          onChange={(event) =>
            onDirectionChange(
              event.target.value as DirectionFilter
            )
          }
        >
          <option value="ALL">전체</option>
          <option value="DEBIT">차변</option>
          <option value="CREDIT">대변</option>
        </select>
      </label>
    </div>

    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={showZeroBalance}
          onChange={(event) => onToggleZeroBalance(event.target.checked)}
          className="h-4 w-4 rounded border border-slate-300"
        />
        잔액 0 계정 보기
      </label>
      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={onlyMovements}
          onChange={(event) => onToggleOnlyMovements(event.target.checked)}
          className="h-4 w-4 rounded border border-slate-300"
        />
        변경 있는 계정만
      </label>
    </div>

    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <label className="flex flex-col text-sm font-medium text-slate-600">
        계정 검색
        <input
          type="text"
          className="mt-2 h-12 rounded-xl border border-slate-200 px-3 text-sm"
          placeholder="코드 또는 계정명을 입력하세요"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>
      <label className="flex flex-col text-sm font-medium text-slate-600">
        정렬
        <select
          className="mt-2 h-12 rounded-xl border border-slate-200 px-3 text-sm"
          value={sortKey}
          onChange={(event) =>
            onSortChange(event.target.value as SortKey)
          }
        >
          <option value="code">기본 (코드 순)</option>
          <option value="balance-desc">잔액 많은 순</option>
          <option value="debit-desc">차변 합계 많은 순</option>
          <option value="credit-desc">대변 합계 많은 순</option>
          <option value="name">계정명 가나다순</option>
        </select>
      </label>
    </div>

    {activeFilters.length > 0 && (
      <div className="mt-4 flex flex-wrap gap-2">
        {activeFilters.map((filter) => (
          <span
            key={filter}
            className="rounded-full border border-slate-200 bg-blue-50 px-3 py-1 text-xs text-blue-700"
          >
            {filter}
          </span>
        ))}
      </div>
    )}
  </div>
);

export default TrialBalanceFilters;
