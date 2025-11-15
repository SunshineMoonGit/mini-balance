import { useEffect, useRef, useState } from "react";

import type { AccountType } from "../../../features/accounts/types/domain";
import { TYPE_LABELS } from "../constants";

type Props = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedTypes: AccountType[];
  onToggleType: (type: AccountType) => void;
  activeFilters: string[];
  onResetFilters: () => void;
  showInactiveAccounts: boolean;
  onToggleInactive: (value: boolean) => void;
};

const AccountsFilters = ({
  searchTerm,
  onSearchChange,
  selectedTypes,
  onToggleType,
  activeFilters,
  onResetFilters,
  showInactiveAccounts,
  onToggleInactive,
}: Props) => {
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showTypeFilter) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target as Node)
      ) {
        setShowTypeFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTypeFilter]);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="rounded-full border border-slate-200 px-4 py-2 text-sm"
          placeholder="코드/이름 검색"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <div className="relative" ref={filterMenuRef}>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600"
            onClick={() => setShowTypeFilter((prev) => !prev)}
          >
            필터
          </button>
          {showTypeFilter && (
            <div className="absolute right-0 top-12 z-10 w-56 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
              <p className="text-xs font-semibold text-slate-500">분류 선택</p>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                {(Object.keys(TYPE_LABELS) as AccountType[]).map((type) => (
                  <label key={type} className="flex items-center justify-between">
                    <span>{TYPE_LABELS[type]}</span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                      checked={selectedTypes.includes(type)}
                      onChange={() => onToggleType(type)}
                    />
                  </label>
                ))}
              </div>
              <div className="mt-4 flex justify-between text-xs">
                <button
                  type="button"
                  className="text-slate-500 underline underline-offset-4"
                  onClick={onResetFilters}
                >
                  초기화
                </button>
                <button
                  type="button"
                  className="rounded-full bg-blue-600 px-3 py-1 font-semibold text-white"
                  onClick={() => setShowTypeFilter(false)}
                >
                  적용
                </button>
              </div>
            </div>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-blue-600"
            checked={showInactiveAccounts}
            onChange={(event) => onToggleInactive(event.target.checked)}
          />
          비활성 계정 보기
        </label>
      </div>
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          {activeFilters.map((filter) => (
            <span
              key={filter}
              className="rounded-full border border-slate-200 px-3 py-1 text-slate-600"
            >
              {filter}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountsFilters;
