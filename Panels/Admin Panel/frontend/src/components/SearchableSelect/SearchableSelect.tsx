import { useEffect, useId, useMemo, useRef, useState } from "react";
import "./SearchableSelect.css";

export type SearchableSelectOption = {
  value: string;
  label: string;
};

export interface SearchableSelectProps {
  label: string;
  name: string;
  value: string;
  options: SearchableSelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  errorMessage?: string;
}

export function SearchableSelect({
  label,
  name,
  value,
  options,
  onChange,
  disabled = false,
  required = false,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  errorMessage,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const buttonId = useId();
  const searchId = useId();

  const selected = options.find((o) => o.value === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);

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
      window.clearTimeout(t);
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
        "searchable-select",
        open ? "searchable-select--open" : "",
        disabled ? "searchable-select--disabled" : "",
        errorMessage ? "searchable-select--error" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      ref={rootRef}
    >
      <span className="searchable-select__label" id={`${buttonId}-label`}>
        {label}
        {required ? (
          <span className="searchable-select__required"> *</span>
        ) : null}
      </span>
      <button
        type="button"
        id={buttonId}
        name={name}
        className="searchable-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${buttonId}-label ${buttonId}`}
        aria-invalid={errorMessage ? true : undefined}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="searchable-select__value">
          {selected?.label || placeholder}
        </span>
        <span className="searchable-select__chevron" aria-hidden="true">
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
        <div className="searchable-select__panel" role="presentation">
          <label className="searchable-select__search" htmlFor={searchId}>
            <span className="visually-hidden">Search options</span>
            <input
              ref={searchRef}
              id={searchId}
              type="search"
              className="searchable-select__search-input"
              value={query}
              placeholder={searchPlaceholder}
              autoComplete="off"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const first = filtered[0];
                  if (first) choose(first.value);
                }
              }}
            />
          </label>
          <ul
            id={listId}
            className="searchable-select__menu"
            role="listbox"
            aria-labelledby={`${buttonId}-label`}
          >
            {filtered.length === 0 ? (
              <li className="searchable-select__empty" role="presentation">
                No matches
              </li>
            ) : (
              filtered.map((option) => {
                const isSelected = option.value === value;
                return (
                  <li key={`${option.value}-${option.label}`} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={[
                        "searchable-select__option",
                        isSelected
                          ? "searchable-select__option--selected"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => choose(option.value)}
                    >
                      <span>{option.label}</span>
                      {isSelected ? (
                        <span
                          className="searchable-select__check"
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}

      {errorMessage ? (
        <p className="searchable-select__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
