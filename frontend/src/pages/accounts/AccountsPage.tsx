import { useMemo, useState } from "react";

import { useAccounts } from "../../features/accounts/hooks/useAccounts";
import type { Account } from "../../features/accounts/types/domain";
import { useJournalEntries } from "../../features/journal/hooks/useJournal";
import { Card, SectionHeader } from "../../shared/components/ui";
import AccountFormSection, {
  type AccountFormState,
} from "./components/AccountFormSection";
import AccountsFilters from "./components/AccountsFilters";
import AccountsSummary from "./components/AccountsSummary";
import AccountsTable from "./components/AccountsTable";
import { TYPE_LABELS } from "./constants";
import { useAccountFilters } from "./hooks/useAccountFilters";
import { useAccountFormState } from "./hooks/useAccountFormState";

const INITIAL_FORM_STATE: AccountFormState = {
  code: "",
  name: "",
  type: "asset",
  description: "",
};

const AccountsPage = () => {
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    formState: newAccount,
    formErrors,
    handleFormChange,
    resetForm,
    setFormErrors,
    setFormState,
  } = useAccountFormState(INITIAL_FORM_STATE);

  const {
    showInactiveAccounts,
    searchTerm,
    selectedTypes,
    toggleTypeSelection,
    resetFilters,
    handleToggleInactive,
    setSearchTerm,
  } = useAccountFilters();

  const {
    data: accounts,
    loading,
    error,
    createAccount,
    updateAccount,
    deactivateAccount,
    activateAccount,
    isDeactivating,
    isActivating,
  } = useAccounts({ includeInactive: showInactiveAccounts });
  const { data: entries = [] } = useJournalEntries();

  const filteredAccounts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return accounts.filter((account) => {
      const matchesSearch = normalizedSearch
        ? account.name.toLowerCase().includes(normalizedSearch) ||
          account.code.toLowerCase().includes(normalizedSearch)
        : true;
      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(account.type);
      return matchesSearch && matchesType;
    });
  }, [accounts, searchTerm, selectedTypes]);

  const activeFilters = useMemo(() => {
    const filters: string[] = [];
    if (searchTerm.trim()) {
      filters.push(`검색: ${searchTerm.trim()}`);
    }
    if (selectedTypes.length > 0) {
      filters.push(
        ...selectedTypes.map((type) => `분류: ${TYPE_LABELS[type] ?? type}`)
      );
    }
    return filters;
  }, [searchTerm, selectedTypes]);

  const usedAccountIds = useMemo(() => {
    const ids = new Set<number>();
    entries.forEach((entry) => {
      entry.lines.forEach((line) => ids.add(line.accountId));
    });
    return ids;
  }, [entries]);

  const summaryCards = useMemo(() => {
    const counts = accounts.reduce((acc, account) => {
      acc[account.type] = (acc[account.type] ?? 0) + 1;
      return acc;
    }, {} as Record<Account["type"], number>);

    return [
      { label: "총 계정 수", value: `${accounts.length}개` },
      { label: "자산 계정", value: `${counts.asset ?? 0}개` },
      { label: "부채 계정", value: `${counts.liability ?? 0}개` },
      {
        label: "자본/수익/비용",
        value: `${
          (counts.equity ?? 0) + (counts.revenue ?? 0) + (counts.expense ?? 0)
        }개`,
      },
    ];
  }, [accounts]);

  const handleSubmit = async () => {
    const errors: { code?: string; name?: string } = {};

    if (!newAccount.code?.trim()) {
      errors.code = "계정 코드를 입력해주세요.";
    }
    if (!newAccount.name?.trim()) {
      errors.name = "계정 이름을 입력해주세요.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);
    try {
      await createAccount(newAccount);
      setFormState(INITIAL_FORM_STATE);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "계정 추가에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    resetForm();
  };

  const handleCloseForm = () => {
    handleResetForm();
    setShowCreateForm(false);
  };

  const handleDeactivateAccount = async (account: Account) => {
    if (usedAccountIds.has(account.id)) {
      alert("분개에 사용 중인 계정은 비활성화할 수 없습니다.");
      return;
    }
    if (
      !window.confirm(
        `${account.code} · ${account.name} 계정을 비활성화하시겠습니까?`
      )
    ) {
      return;
    }

    try {
      await deactivateAccount(account.id);
      setSelectedAccountId(null);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "계정 비활성화에 실패했습니다."
      );
    }
  };

  const handleActivateAccount = async (account: Account) => {
    if (account.isActive) {
      return;
    }
    if (
      !window.confirm(
        `${account.code} · ${account.name} 계정을 활성화하시겠습니까?`
      )
    ) {
      return;
    }
    try {
      await activateAccount(account.id);
      setSelectedAccountId(null);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "계정을 활성화하지 못했습니다."
      );
    }
  };

  return (
    <section className="space-y-6">
      <AccountsSummary cards={summaryCards} />

      {showCreateForm ? (
        <AccountFormSection
          formState={newAccount}
          editingAccount={null}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onReset={handleResetForm}
          onCancelEdit={() => undefined}
          isSubmitting={isSubmitting}
          onCloseForm={handleCloseForm}
          errors={formErrors}
        />
      ) : (
        <Card
          variant="outline"
          className="border-dashed border-slate-200 bg-white/80 p-6 text-center"
        >
          <p className="text-sm text-slate-500">
            새로운 계정을 추가하려면 아래 버튼을 눌러주세요.
          </p>
          <button
            type="button"
            className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            onClick={() => setShowCreateForm(true)}
          >
            계정 추가
          </button>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex justify-between">
          <SectionHeader label="계정과목 목록" title="모든 계정" />
          <AccountsFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedTypes={selectedTypes}
            onToggleType={toggleTypeSelection}
            activeFilters={activeFilters}
            onResetFilters={resetFilters}
            showInactiveAccounts={showInactiveAccounts}
            onToggleInactive={(value) => {
              handleToggleInactive(value);
              setSelectedAccountId(null);
            }}
          />
        </div>

        {error && <p className="mt-4 text-sm text-rose-500">{error}</p>}
        <AccountsTable
          loading={loading}
          accounts={accounts}
          filteredAccounts={filteredAccounts}
          selectedAccountId={selectedAccountId}
          setSelectedAccountId={setSelectedAccountId}
          usedAccountIds={usedAccountIds}
          handleDeactivateAccount={handleDeactivateAccount}
          handleActivateAccount={handleActivateAccount}
          updateAccount={updateAccount}
          isDeactivating={isDeactivating}
          isActivating={isActivating}
        />
      </Card>
    </section>
  );
};

export default AccountsPage;
