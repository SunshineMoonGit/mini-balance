import {
  createJournalEntry,
  deleteJournalEntry,
  getJournalEntries,
  updateJournalEntry,
  type ListJournalEntriesParams,
} from "../../../shared/api/journals";
import type { JournalEntry } from "../types/domain";
import type { JournalEntryCreateDto, JournalEntryDto } from "../types/dto";

const mapEntry = (dto: JournalEntryDto): JournalEntry => ({
  id: dto.id,
  description: dto.description,
  postedAt: dto.date,
  lines: dto.lines.map((line) => ({
    id: line.id,
    accountId: line.account_id,
    debit: Number(line.debit),
    credit: Number(line.credit),
  })),
});

export const journalApi = {
  async listEntries(params?: ListJournalEntriesParams): Promise<JournalEntry[]> {
    const response = await getJournalEntries(params);
    return response.map(mapEntry);
  },
  async createEntry(payload: JournalEntryCreateDto): Promise<JournalEntry> {
    const response = await createJournalEntry(payload);
    return mapEntry(response);
  },
  async updateEntry(id: number, payload: JournalEntryCreateDto): Promise<JournalEntry> {
    const response = await updateJournalEntry(id, payload);
    return mapEntry(response);
  },
  async deleteEntry(id: number) {
    return deleteJournalEntry(id);
  },
};
