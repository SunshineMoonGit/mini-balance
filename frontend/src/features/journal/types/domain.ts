export type JournalLine = {
  id: number;
  accountId: number;
  debit: number;
  credit: number;
};

export type JournalEntry = {
  id: number;
  description: string | null;
  postedAt: string;
  lines: JournalLine[];
};
