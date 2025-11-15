import {
  useCreateJournalEntry,
  useDeleteJournalEntry,
  useUpdateJournalEntry,
} from "../../../features/journal/hooks/useJournal";
import { toastService } from "../../../shared/components/toast/toastService";
import type { JournalEntry } from "../../../features/journal/types/domain";

type JournalFormValues = {
  date: string;
  description: string;
  lines: Array<{
    accountId: number;
    debit: number;
    credit: number;
  }>;
};

export const useJournalOperations = (
  editingEntry: JournalEntry | null,
  resetForm: () => void
) => {
  const { mutateAsync: createEntry, isPending: isCreatingEntry } =
    useCreateJournalEntry();
  const { mutateAsync: updateEntry, isPending: isUpdatingEntry } =
    useUpdateJournalEntry();
  const { mutateAsync: deleteEntry, isPending: isDeletingEntry } =
    useDeleteJournalEntry();

  const handleSubmit = async (values: JournalFormValues) => {
    const payload = {
      date: values.date,
      description: values.description.trim(),
      lines: values.lines.map((line) => ({
        account_id: line.accountId,
        debit: line.debit,
        credit: line.credit,
      })),
    };

    try {
      if (editingEntry) {
        await updateEntry({ id: editingEntry.id, payload });
      } else {
        await createEntry(payload);
      }
      toastService.notify({
        message: editingEntry
          ? "전표 수정이 완료되었습니다."
          : "전표를 등록했습니다.",
        variant: "success",
      });
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (entry: JournalEntry) => {
    if (isDeletingEntry) {
      return;
    }
    if (!window.confirm("선택한 전표를 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteEntry(entry.id);
      if (editingEntry?.id === entry.id) {
        resetForm();
      }
      toastService.notify({
        message: "전표를 삭제했습니다.",
        variant: "success",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return {
    handleSubmit,
    handleDelete,
    isFormSubmitting: isCreatingEntry || isUpdatingEntry,
    isDeletingEntry,
  };
};
