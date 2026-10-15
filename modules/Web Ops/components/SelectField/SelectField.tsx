import type { SelectHTMLAttributes } from "react";
import { useId } from "react";
import "./SelectField.css";

export interface SelectFieldOption {
  value: string;
  label: string;
}

export interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  label: string;
  options: SelectFieldOption[];
  errorMessage?: string;
  placeholder?: string;
}

export function SelectField({
  label,
  options,
  errorMessage,
  placeholder = "Select an option",
  className = "",
  name,
  required,
  disabled,
  ...rest
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = name ? `select-${name}` : generatedId;
  const errorId = `${selectId}-error`;
  const hasError = Boolean(errorMessage);

  return (
    <div
      className={[
        "select-field",
        hasError ? "select-field--error" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <label className="select-field__label" htmlFor={selectId}>
        {label}
        {required ? <span className="select-field__required"> *</span> : null}
      </label>
      <select
        id={selectId}
        className="select-field__input"
        name={name}
        required={required}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hasError ? (
        <p id={errorId} className="select-field__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
