/**
 * UI 관련 상수 정의
 */

// 스크롤 관련
export const SCROLL_HEADER_OFFSET = 96;

// 애니메이션 관련
export const DOUBLE_RAF_DELAY = 2; // requestAnimationFrame을 두 번 호출하기 위한 상수

// 페이지네이션 기본값
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// 스피너 크기
export const SPINNER_SIZE = {
  small: "h-4 w-4",
  medium: "h-8 w-8",
  large: "h-12 w-12",
} as const;

// Z-Index 레이어
export const Z_INDEX = {
  dropdown: 10,
  modal: 50,
  toast: 100,
} as const;
