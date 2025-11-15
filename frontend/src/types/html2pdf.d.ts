export {};

declare global {
  interface Window {
    html2pdf?: {
      (): {
        set: (options: Record<string, unknown>) => {
          from: (element: HTMLElement) => {
            save: () => Promise<void>;
          };
        };
      };
    };
  }
}
