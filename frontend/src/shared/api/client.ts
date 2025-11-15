type ErrorPayload = {
  message: string;
  code?: string;
  details?: unknown;
};

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;

  constructor(payload: ErrorPayload & { status?: number }) {
    super(payload.message);
    this.name = "ApiError";
    this.status = payload.status;
    this.code = payload.code;
    this.details = payload.details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    const ErrorWithCapture = Error as {
      captureStackTrace?: (
        target: object,
        constructorOpt?: new (
          payload: ErrorPayload & { status?: number },
        ) => ApiError,
      ) => void;
    };
    if (typeof ErrorWithCapture.captureStackTrace === "function") {
      ErrorWithCapture.captureStackTrace(this, ApiError);
    }
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://127.0.0.1:8000/api";

/**
 * API 경로를 완전한 URL로 변환
 */
const buildUrl = (path: string): string => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

/**
 * 기본 헤더 생성
 */
const getDefaultHeaders = (): Record<string, string> => ({
  "Content-Type": "application/json",
});

export const apiClient = {
  async get<T>(path: string): Promise<T> {
    try {
      const response = await fetch(buildUrl(path), {
        headers: getDefaultHeaders(),
      });
      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError({
        message: "네트워크 요청에 실패했습니다.",
        details: error,
      });
    }
  },

  async post<T>(path: string, body: unknown): Promise<T> {
    try {
      const response = await fetch(buildUrl(path), {
        method: "POST",
        headers: getDefaultHeaders(),
        body: JSON.stringify(body),
      });
      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError({
        message: "네트워크 요청에 실패했습니다.",
        details: error,
      });
    }
  },

  async put<T>(path: string, body: unknown): Promise<T> {
    try {
      const response = await fetch(buildUrl(path), {
        method: "PUT",
        headers: getDefaultHeaders(),
        body: JSON.stringify(body),
      });
      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError({
        message: "네트워크 요청에 실패했습니다.",
        details: error,
      });
    }
  },

  async delete<T>(path: string): Promise<T> {
    try {
      const response = await fetch(buildUrl(path), {
        method: "DELETE",
        headers: getDefaultHeaders(),
      });
      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError({
        message: "네트워크 요청에 실패했습니다.",
        details: error,
      });
    }
  },
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await extractErrorMessage(response);
    throw new ApiError({ ...payload, status: response.status });
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

async function extractErrorMessage(response: Response): Promise<ErrorPayload> {
  const fallback: ErrorPayload = {
    message: "요청을 처리할 수 없습니다.",
  };

  try {
    const data = await response.json();

    if (typeof data === "string") {
      return { ...fallback, message: data };
    }

    // Pydantic validation errors
    if (Array.isArray(data?.detail)) {
      const joined = data.detail
        .map(
          (item: { msg?: string; message?: string } | null | undefined) =>
            item?.msg ?? item?.message ?? JSON.stringify(item),
        )
        .join(" · ");
      return { ...fallback, message: joined || fallback.message };
    }

    const detail = data?.error ?? data?.detail;
    if (detail) {
      const message = typeof detail === "string" ? detail : detail?.message ?? fallback.message;
      const code = detail?.code;
      const details = detail?.details ?? data?.details;
      return { message, code, details };
    }

    return fallback;
  } catch {
    return fallback;
  }
}
