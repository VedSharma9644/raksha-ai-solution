import { useId, useRef } from "react";
import "./FileField.css";

export interface FileFieldProps {
  label: string;
  name: string;
  accept?: string;
  required?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  /** Currently uploaded file URL (shown when editing an existing record) */
  currentUrl?: string;
  onChange: (file: File | null) => void;
}

export function FileField({
  label,
  name,
  accept = ".pdf,.jpg,.jpeg,.png",
  required,
  disabled,
  errorMessage,
  currentUrl,
  onChange,
}: FileFieldProps) {
  const generatedId = useId();
  const inputId = `file-${name ?? generatedId}`;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(errorMessage);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange() {
    const file = inputRef.current?.files?.[0] ?? null;
    onChange(file);
  }

  return (
    <div className={["file-field", hasError ? "file-field--error" : ""].filter(Boolean).join(" ")}>
      <label className="file-field__label" htmlFor={inputId}>
        {label}
        {required ? <span className="file-field__required"> *</span> : null}
      </label>

      <input
        ref={inputRef}
        id={inputId}
        className="file-field__input"
        type="file"
        name={name}
        accept={accept}
        required={required}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        onChange={handleChange}
      />

      {currentUrl && !inputRef.current?.files?.length ? (
        <a
          className="file-field__current"
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View uploaded file
        </a>
      ) : null}

      {hasError ? (
        <p id={errorId} className="file-field__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
