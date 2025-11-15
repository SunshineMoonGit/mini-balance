import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ListJournalEntriesParams } from "../../../shared/api/journals";
import { journalApi } from "../api/journalApi";
import type { JournalEntry } from "../types/domain";
import type { JournalEntryCreateDto } from "../types/dto";

type UpdateJournalEntryPayload = {
  id: number;
  payload: JournalEntryCreateDto;
};

export const useJournalEntries = (filters?: ListJournalEntriesParams) => {
  return useQuery<JournalEntry[], Error>({
    queryKey: ["journal-entries", filters],
    queryFn: () => journalApi.listEntries(filters),
  });
};

export const useCreateJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: JournalEntryCreateDto) =>
      journalApi.createEntry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      queryClient.invalidateQueries({ queryKey: ["trial-balance"] });
    },
  });
};

export const useUpdateJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateJournalEntryPayload) =>
      journalApi.updateEntry(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      queryClient.invalidateQueries({ queryKey: ["trial-balance"] });
    },
  });
};

export const useDeleteJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryId: number) => journalApi.deleteEntry(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      queryClient.invalidateQueries({ queryKey: ["trial-balance"] });
    },
  });
};
