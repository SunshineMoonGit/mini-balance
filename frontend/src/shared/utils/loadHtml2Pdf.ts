let loaderPromise: Promise<typeof window.html2pdf> | null = null;

export const loadHtml2Pdf = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("브라우저 환경에서만 사용할 수 있습니다."));
  }
  if (window.html2pdf) {
    return Promise.resolve(window.html2pdf);
  }
  if (!loaderPromise) {
    loaderPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js";
      script.async = true;
      script.onload = () => {
        if (window.html2pdf) {
          resolve(window.html2pdf);
        } else {
          reject(new Error("html2pdf.js 로드를 완료했지만 객체를 찾을 수 없습니다."));
        }
      };
      script.onerror = () => reject(new Error("html2pdf.js 스크립트를 불러오지 못했습니다."));
      document.body.appendChild(script);
    });
  }
  return loaderPromise;
};
