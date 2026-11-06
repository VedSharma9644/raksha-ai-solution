import { useId, useState } from "react";
import type { GuardDocument } from "@raskha/guard-management";
import "./MultiFileField.css";

const MAX_FILES = 20;
const MAX_BYTES = 15 * 1024 * 1024;

export interface MultiFileFieldProps {
  label: string;
  name: string;
  files?: File[];
  existing?: GuardDocument[];
  required?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  onFilesChange: (files: File[]) => void;
  onExistingChange?: (documents: GuardDocument[]) => void;
}

export function MultiFileField({
  label,
  name,
  files = [],
  existing = [],
  required,
  disabled,
  errorMessage,
  onFilesChange,
  onExistingChange,
}: MultiFileFieldProps) {
  const generatedId = useId();
  const inputId = `files-${name}-${generatedId}`;
  const errorId = `${inputId}-error`;
  const [localError, setLocalError] = useState("");
  const message = errorMessage || localError;

  function addFiles(list: FileList | null) {
    if (!list || disabled) return;
    const next = [...files];
    let problem = "";
    for (const file of Array.from(list)) {
      if (file.size > MAX_BYTES) {
        problem = `${file.name} is larger than 15 MB.`;
        continue;
      }
      if (existing.length + next.length >= MAX_FILES) {
        problem = "You can attach up to 20 files.";
        break;
      }
      next.push(file);
    }
    setLocalError(problem);
    onFilesChange(next);
  }

  return (
    <div className={["multi-file-field", message ? "multi-file-field--error" : ""].filter(Boolean).join(" ")}>
      <label className="multi-file-field__label" htmlFor={inputId}>
        {label}
        {required ? <span className="multi-file-field__required"> *</span> : null}
      </label>
      <p className="multi-file-field__hint">
        Add images or files. You can select more than one.
      </p>
      <input
        id={inputId}
        className="multi-file-field__input"
        type="file"
        name={name}
        multiple
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
        disabled={disabled}
        aria-invalid={Boolean(message) || undefined}
        aria-describedby={message ? errorId : undefined}
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {existing.length > 0 || files.length > 0 ? (
        <ul className="multi-file-field__list">
          {existing.map((document) => (
            <li key={document.url} className="multi-file-field__item">
              <a href={document.url} target="_blank" rel="noopener noreferrer">
                {document.name}
              </a>
              <button
                type="button"
                className="multi-file-field__remove"
                disabled={disabled}
                onClick={() =>
                  onExistingChange?.(
                    existing.filter((item) => item.url !== document.url)
                  )
                }
              >
                Remove
              </button>
            </li>
          ))}
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}-${index}`} className="multi-file-field__item">
              <span>{file.name}</span>
              <button
                type="button"
                className="multi-file-field__remove"
                disabled={disabled}
                onClick={() => onFilesChange(files.filter((_, itemIndex) => itemIndex !== index))}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {message ? (
        <p id={errorId} className="multi-file-field__error" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}
