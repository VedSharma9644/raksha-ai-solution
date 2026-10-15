import { useEffect, useId, useRef, useState } from "react";
import "./EarningsPeriodSelect.css";

export type EarningsPeriodSelectOption = {
  value: string;
  label: string;
};

export interface EarningsPeriodSelectProps {
  label: string;
  name: string;
  value: string;
  options: EarningsPeriodSelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function EarningsPeriodSelect({
  label,
  name,
  value,
  options,
  onChange,
  disabled = false,
}: EarningsPeriodSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const buttonId = useId();

  const selected =
    options.find((o) => o.value === value) ?? options[0] ?? null;

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div
      className={[
        "earnings-period-select",
        open ? "earnings-period-select--open" : "",
        disabled ? "earnings-period-select--disabled" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      ref={rootRef}
    >
      <span className="earnings-period-select__label" id={`${buttonId}-label`}>
        {label}
      </span>
      <button
        type="button"
        id={buttonId}
        name={name}
        className="earnings-period-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${buttonId}-label ${buttonId}`}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="earnings-period-select__value">
          {selected?.label ?? "Select…"}
        </span>
        <span className="earnings-period-select__chevron" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open ? (
        <ul
          id={listId}
          className="earnings-period-select__menu"
          role="listbox"
          aria-labelledby={`${buttonId}-label`}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={[
                    "earnings-period-select__option",
                    isSelected
                      ? "earnings-period-select__option--selected"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => choose(option.value)}
                >
                  <span>{option.label}</span>
                  {isSelected ? (
                    <span
                      className="earnings-period-select__check"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
