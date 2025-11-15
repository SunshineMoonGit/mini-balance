import { useEffect, useMemo, useRef, useState } from "react";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTH_LABELS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

type DatePickerProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  className?: string;
};

const formatDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatHumanDate = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const DatePicker = ({
  value,
  onChange,
  placeholder = "날짜 선택",
  min,
  max,
  className = "",
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const initialDate = value ? new Date(value) : new Date();
  const [viewDate, setViewDate] = useState(
    Number.isNaN(initialDate.getTime()) ? new Date() : initialDate,
  );
  const [viewMode, setViewMode] = useState<"day" | "month" | "year">("day");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value) : null;
  const today = new Date();

  const days = useMemo(() => {
    const startOfMonth = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth(),
      1,
    );
    const startDay = startOfMonth.getDay();
    const daysInMonth = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() + 1,
      0,
    ).getDate();

    const result: { date: Date; inMonth: boolean }[] = [];

    for (let i = startDay - 1; i >= 0; i -= 1) {
      result.push({
        date: new Date(
          viewDate.getFullYear(),
          viewDate.getMonth(),
          -i,
        ),
        inMonth: false,
      });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      result.push({
        date: new Date(
          viewDate.getFullYear(),
          viewDate.getMonth(),
          day,
        ),
        inMonth: true,
      });
    }

    while (result.length < 42) {
      const lastDate = result[result.length - 1].date;
      const nextDate = new Date(lastDate);
      nextDate.setDate(lastDate.getDate() + 1);
      result.push({ date: nextDate, inMonth: false });
    }

    return result;
  }, [viewDate]);

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        setViewDate(date);
      }
    }
  }, [value]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setViewMode("day");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isDisabled = (date: Date) => {
    if (min) {
      const minDate = new Date(min);
      if (!Number.isNaN(minDate.getTime()) && date < minDate) {
        return true;
      }
    }
    if (max) {
      const maxDate = new Date(max);
      if (!Number.isNaN(maxDate.getTime()) && date > maxDate) {
        return true;
      }
    }
    return false;
  };

  const handleSelectDate = (date: Date) => {
    if (isDisabled(date)) {
      return;
    }
    onChange(formatDateValue(date));
    setViewMode("day");
    window.requestAnimationFrame(() => setIsOpen(false));
  };

  const renderDay = (day: { date: Date; inMonth: boolean }) => {
    const dateValue = formatDateValue(day.date);
    const isSelected =
      selectedDate && formatDateValue(selectedDate) === dateValue;
    const isToday =
      formatDateValue(today) === dateValue && day.inMonth;
    const disabled = isDisabled(day.date);

    return (
      <button
        key={dateValue}
        type="button"
        className={`h-10 rounded-full text-sm transition ${
          isSelected
            ? "bg-blue-600 text-white"
            : isToday
            ? "border border-blue-200 text-blue-600"
            : day.inMonth
            ? "text-slate-700 hover:bg-slate-100"
            : "text-slate-300"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        onClick={() => handleSelectDate(day.date)}
        disabled={disabled}
      >
        {day.date.getDate()}
      </button>
    );
  };

  const changeMonth = (offset: number) => {
    setViewDate(
      new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1),
    );
  };

  const changeYear = (offset: number) => {
    setViewDate(
      new Date(viewDate.getFullYear() + offset, viewDate.getMonth(), 1),
    );
  };

  const changeYearBlock = (offset: number) => {
    setViewDate(
      new Date(viewDate.getFullYear() + offset * 12, viewDate.getMonth(), 1),
    );
  };

  const renderMonthGrid = () => (
    <div className="mt-3 grid grid-cols-3 gap-2">
      {MONTH_LABELS.map((label, index) => (
        <button
          key={label}
          type="button"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
          onClick={() => {
            setViewDate(
              new Date(viewDate.getFullYear(), index, 1),
            );
            setViewMode("day");
            setIsOpen(true);
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const renderYearGrid = () => {
    const baseYear = Math.floor(viewDate.getFullYear() / 12) * 12;
    const years = Array.from({ length: 12 }, (_, idx) => baseYear + idx);
    return (
      <div className="mt-3 grid grid-cols-3 gap-2">
        {years.map((year) => (
          <button
            key={year}
            type="button"
            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
              year === viewDate.getFullYear()
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-slate-200 text-slate-700 hover:border-blue-200 hover:text-blue-600"
            }`}
            onClick={() => {
              setViewDate(new Date(year, viewDate.getMonth(), 1));
              setViewMode("month");
              setIsOpen(true);
            }}
          >
            {year}년
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className={`flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:border-blue-300 focus:border-blue-400 focus:outline-none ${className}`}
        onClick={() => setIsOpen(true)}
      >
        <span>
          {value ? (
            formatHumanDate(value)
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </span>
        <span className="text-slate-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M6 2a1 1 0 012 0v1h4V2a1 1 0 012 0v1h1.5A1.5 1.5 0 0117 4.5v11A1.5 1.5 0 0115.5 17h-11A1.5 1.5 0 013 15.5v-11A1.5 1.5 0 014.5 3H6V2Zm9 6H5v7.5a.5.5 0 00.5.5h9a.5.5 0 00.5-.5V8Z" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-700">
            <button
              type="button"
              className="h-10 w-10 rounded-full text-slate-500 transition hover:bg-slate-100"
              onClick={() => {
                if (viewMode === "day") changeMonth(-1);
                else if (viewMode === "month") changeYear(-1);
                else changeYearBlock(-1);
              }}
            >
              ‹
            </button>
            <div className="flex flex-col items-center text-sm font-semibold">
              <button
                type="button"
                className={`rounded px-2 py-1 transition ${
                  viewMode === "year"
                    ? "bg-slate-100 text-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
                onClick={() => setViewMode("year")}
              >
                {viewDate.getFullYear()}년
              </button>
              {viewMode !== "year" && (
                <button
                  type="button"
                  className={`rounded px-2 py-1 transition ${
                    viewMode === "month"
                      ? "bg-slate-100 text-slate-800"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                  onClick={() => setViewMode("month")}
                >
                  {viewDate.getMonth() + 1}월
                </button>
              )}
            </div>
            <button
              type="button"
              className="h-10 w-10 rounded-full text-slate-500 transition hover:bg-slate-100"
              onClick={() => {
                if (viewMode === "day") changeMonth(1);
                else if (viewMode === "month") changeYear(1);
                else changeYearBlock(1);
              }}
            >
              ›
            </button>
          </div>
          {viewMode === "day" && (
            <>
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400">
                {DAY_LABELS.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-2 text-center">
                {days.map(renderDay)}
              </div>
            </>
          )}
          {viewMode === "month" && renderMonthGrid()}
          {viewMode === "year" && renderYearGrid()}
        </div>
      )}
    </div>
  );
};

export default DatePicker;
