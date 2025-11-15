import { toastService } from "../../../shared/components/toast/toastService";
import {
  downloadJournalEntriesCsv,
  downloadJournalEntriesPdf,
} from "../../../shared/utils/exporters";
import type { JournalEntry } from "../../../features/journal/types/domain";

export const useJournalDownload = (
  entries: JournalEntry[],
  accountLookup: Record<number, string>
) => {
  const handleDownloadCsv = () => {
    if (entries.length === 0) {
      toastService.notify({
        message: "다운로드할 전표가 없습니다.",
        variant: "error",
      });
      return;
    }
    downloadJournalEntriesCsv(entries, accountLookup);
    toastService.notify({
      message: "CSV 다운로드를 준비했습니다.",
      variant: "success",
    });
  };

  const handleDownloadPdf = () => {
    if (entries.length === 0) {
      toastService.notify({
        message: "다운로드할 전표가 없습니다.",
        variant: "error",
      });
      return;
    }
    downloadJournalEntriesPdf(entries, accountLookup);
    toastService.notify({
      message: "PDF 다운로드를 준비했습니다.",
      variant: "success",
    });
  };

  return {
    handleDownloadCsv,
    handleDownloadPdf,
  };
};
