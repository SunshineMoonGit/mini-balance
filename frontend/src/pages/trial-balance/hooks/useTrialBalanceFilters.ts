import { useCallback, useMemo, useState } from "react";

import type { TrialBalanceLine } from "../../../features/trialBalance/types/domain";
import { getCurrentMonthPeriod } from "../../../shared/utils/formatDate";

export type AccountTypeOption = "ALL" | "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
export type DirectionFilter = "ALL" | "DEBIT" | "CREDIT";
export type SortKey = "code" | "name" | "balance-desc" | "debit-desc" | "credit-desc";

export type TrialBalancePeriod = ReturnType<typeof getCurrentMonthPeriod>;

type Options = {
  onSelectionReset?: () => void;
};

export const useTrialBalanceFilters = (options?: Options) => {
  const [formFilters, setFormFilters] = useState(getCurrentMonthPeriod);
  const [filters, setFilters] = useState(getCurrentMonthPeriod);
  const [accountTypeFilter, setAccountTypeFilter] = useState<AccountTypeOption>("ALL");
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>("ALL");
  const [onlyMovements, setOnlyMovements] = useState(false);
  const [showZeroBalance, setShowZeroBalance] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("code");

  const onSelectionReset = options?.onSelectionReset;

  const params = useMemo(() => {
    if (!filters.from || !filters.to) {
      return undefined;
    }
    return { from: filters.from, to: filters.to };
  }, [filters]);

  const applyFilters = useCallback(() => {
    setFilters(formFilters);
    onSelectionReset?.();
  }, [formFilters, onSelectionReset]);

  const resetFilters = useCallback(() => {
    const defaults = getCurrentMonthPeriod();
    setFormFilters(defaults);
    setFilters(defaults);
    onSelectionReset?.();
  }, [onSelectionReset]);

  const handleAccountTypeChange = useCallback(
    (value: AccountTypeOption) => {
      setAccountTypeFilter(value);
      onSelectionReset?.();
    },
    [onSelectionReset]
  );

  const handleDirectionChange = useCallback(
    (value: DirectionFilter) => {
      setDirectionFilter(value);
      onSelectionReset?.();
    },
    [onSelectionReset]
  );

  const toggleZeroBalance = useCallback(
    (value: boolean) => {
      setShowZeroBalance(value);
      onSelectionReset?.();
    },
    [onSelectionReset]
  );

  const toggleOnlyMovements = useCallback(
    (value: boolean) => {
      setOnlyMovements(value);
      onSelectionReset?.();
    },
    [onSelectionReset]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      onSelectionReset?.();
    },
    [onSelectionReset]
  );

  const handleSortChange = useCallback(
    (value: SortKey) => {
      setSortKey(value);
      onSelectionReset?.();
    },
    [onSelectionReset]
  );

  const filterLines = useCallback(
    (lines: TrialBalanceLine[]) => {
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const filtered = lines.filter((line) => {
        if (accountTypeFilter !== "ALL" && line.type !== accountTypeFilter) {
          return false;
        }
        if (directionFilter !== "ALL" && line.endingBalance.direction !== directionFilter) {
          return false;
        }
        if (onlyMovements && line.totalDebit === 0 && line.totalCredit === 0) {
          return false;
        }
        if (!showZeroBalance && line.endingBalance.amount === 0) {
          return false;
        }
        if (normalizedSearch) {
          const codeMatch = line.accountCode.toLowerCase().includes(normalizedSearch);
          const nameMatch = line.accountName.toLowerCase().includes(normalizedSearch);
          if (!codeMatch && !nameMatch) {
            return false;
          }
        }
        return true;
      });
      const sorted = [...filtered].sort((a, b) => {
        switch (sortKey) {
          case "code":
            return a.accountCode.localeCompare(b.accountCode, undefined, {
              numeric: true,
            });
          case "name":
            return a.accountName.localeCompare(b.accountName, "ko");
          case "debit-desc":
            return b.totalDebit - a.totalDebit;
          case "credit-desc":
            return b.totalCredit - a.totalCredit;
          case "balance-desc":
          default:
            return b.endingBalance.amount - a.endingBalance.amount;
        }
      });
      return sorted;
    },
    [accountTypeFilter, directionFilter, onlyMovements, showZeroBalance, searchTerm, sortKey]
  );

  const activeFilters = useMemo<string[]>(() => {
    const filtersArray: (string | null)[] = [
      accountTypeFilter !== "ALL" ? `분류: ${accountTypeFilter}` : null,
      directionFilter !== "ALL" ? `잔액 방향: ${directionFilter}` : null,
      onlyMovements ? "변동 있는 계정만" : null,
      searchTerm ? `검색: ${searchTerm}` : null,
    ];
    return filtersArray.filter((item): item is string => Boolean(item));
  }, [accountTypeFilter, directionFilter, onlyMovements, searchTerm]);

  return {
    formFilters,
    setFormFilters,
    filters,
    params,
    applyFilters,
    resetFilters,
    accountTypeFilter,
    directionFilter,
    onlyMovements,
    showZeroBalance,
    searchTerm,
    sortKey,
    activeFilters,
    filterLines,
    handleAccountTypeChange,
    handleDirectionChange,
    toggleZeroBalance,
    toggleOnlyMovements,
    handleSearchChange,
    handleSortChange,
  };
};
