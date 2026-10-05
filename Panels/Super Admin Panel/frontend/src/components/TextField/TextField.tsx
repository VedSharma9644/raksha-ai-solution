import type { InputHTMLAttributes } from "react";
import { useId } from "react";
import "./TextField.css";

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  errorMessage?: string;
  hint?: string;
}

export function TextField({
  label,
  errorMessage,
  hint,
  className = "",
  type = "text",
  name,
  required,
  disabled,
  ...rest
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = name ? `field-${name}` : generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const hasError = Boolean(errorMessage);

  const describedBy = [
    hasError ? errorId : null,
    hint && !hasError ? hintId : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={[
        "text-field",
        hasError ? "text-field--error" : "",
        disabled ? "text-field--disabled" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <label className="text-field__label" htmlFor={inputId}>
        {label}
        {required ? <span className="text-field__required"> *</span> : null}
      </label>

      <input
        id={inputId}
        className="text-field__input"
        type={type}
        name={name}
        required={required}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy || undefined}
        {...rest}
      />

      {hasError ? (
        <p id={errorId} className="text-field__error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {hint && !hasError ? (
        <p id={hintId} className="text-field__hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
