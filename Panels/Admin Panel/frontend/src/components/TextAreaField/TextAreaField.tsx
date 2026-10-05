import type { TextareaHTMLAttributes } from "react";
import { useId } from "react";
import "./TextAreaField.css";

export interface TextAreaFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  label: string;
  errorMessage?: string;
}

export function TextAreaField({
  label,
  errorMessage,
  className = "",
  name,
  required,
  disabled,
  rows = 4,
  ...rest
}: TextAreaFieldProps) {
  const generatedId = useId();
  const areaId = name ? `area-${name}` : generatedId;
  const errorId = `${areaId}-error`;
  const hasError = Boolean(errorMessage);

  return (
    <div
      className={[
        "text-area-field",
        hasError ? "text-area-field--error" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <label className="text-area-field__label" htmlFor={areaId}>
        {label}
        {required ? (
          <span className="text-area-field__required"> *</span>
        ) : null}
      </label>
      <textarea
        id={areaId}
        className="text-area-field__input"
        name={name}
        required={required}
        disabled={disabled}
        rows={rows}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        {...rest}
      />
      {hasError ? (
        <p id={errorId} className="text-area-field__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
