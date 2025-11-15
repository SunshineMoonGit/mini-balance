export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("ko-KR").format(value);
};

const currencySymbolMap: Record<string, string> = {
  KRW: "₩",
  USD: "$",
  EUR: "€",
};

export type FormatCurrencyOptions = {
  /**
   * 문자열로 대체할 값 (예: "-"). undefined면 항상 숫자를 출력합니다.
   */
  zeroDisplay?: string;
  /**
   * 통화 기호(₩ 등) 표시 여부. 기본 true.
   */
  showSymbol?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

export const formatCurrency = (
  value: number,
  currency = "KRW",
  options: FormatCurrencyOptions = {},
): string => {
  const {
    zeroDisplay,
    showSymbol = true,
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = options;

  if (zeroDisplay !== undefined && value === 0) {
    return zeroDisplay;
  }

  const numberFormatter = new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits,
    maximumFractionDigits,
  });
  const formatted = numberFormatter.format(value);

  if (!showSymbol) {
    return formatted;
  }
  const symbol = currencySymbolMap[currency] ?? currency;
  return `${symbol} ${formatted}`;
};
