import { useEffect, useId, useState } from "react";
import {
  APPEARANCE_PRESETS,
  DEFAULT_APPEARANCE,
  applyPageAppearance,
  getSavedAppearance,
  normalizeHexColor,
  resetPageAppearance,
  type AppearanceColors,
} from "@raskha/shared";
import "./AppearancePicker.css";

export interface AppearancePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onAppearanceChange?: () => void;
}

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  return (
    <div className="appearance-picker__field">
      <label className="appearance-picker__field-label" htmlFor={id}>
        {label}
      </label>
      <div className="appearance-picker__field-controls">
        <input
          id={id}
          className="appearance-picker__swatch-input"
          type="color"
          value={value}
          aria-label={`${label} color`}
          onChange={(event) => {
            const next = event.target.value.toLowerCase();
            setText(next);
            onChange(next);
          }}
        />
        <input
          className="appearance-picker__hex-input"
          type="text"
          value={text}
          spellCheck={false}
          aria-label={`${label} hex value`}
          onChange={(event) => {
            const next = event.target.value;
            setText(next);
            const normalized = normalizeHexColor(next);
            if (normalized) onChange(normalized);
          }}
          onBlur={() => {
            const normalized = normalizeHexColor(text);
            if (normalized) {
              setText(normalized);
              onChange(normalized);
            } else {
              setText(value);
            }
          }}
        />
      </div>
    </div>
  );
}

export function AppearancePicker({
  isOpen,
  onClose,
  onAppearanceChange,
}: AppearancePickerProps) {
  const titleId = useId();
  const [draft, setDraft] = useState<AppearanceColors>(getSavedAppearance);

  useEffect(() => {
    if (!isOpen) return;
    setDraft(getSavedAppearance());
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function commit(next: AppearanceColors) {
    setDraft(next);
    applyPageAppearance(next);
    onAppearanceChange?.();
  }

  function handleReset() {
    resetPageAppearance();
    setDraft({ ...DEFAULT_APPEARANCE });
    onAppearanceChange?.();
  }

  return (
    <div className="appearance-picker" role="presentation">
      <button
        type="button"
        className="appearance-picker__backdrop"
        aria-label="Close appearance picker"
        onClick={onClose}
      />

      <div
        className="appearance-picker__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="appearance-picker__header">
          <div>
            <h2 id={titleId} className="appearance-picker__title">
              Appearance
            </h2>
            <p className="appearance-picker__support">
              Choose primary and secondary brand colors. Buttons, links, and
              accents across the panel update immediately.
            </p>
          </div>
          <button
            type="button"
            className="appearance-picker__close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="appearance-picker__preview" aria-hidden="true">
          <span
            className="appearance-picker__preview-chip appearance-picker__preview-chip--primary"
            style={{ background: draft.primary }}
          />
          <span
            className="appearance-picker__preview-chip appearance-picker__preview-chip--secondary"
            style={{ background: draft.secondary }}
          />
          <span className="appearance-picker__preview-button">Sample button</span>
        </div>

        <p className="appearance-picker__section-label">Presets</p>
        <div className="appearance-picker__presets">
          {APPEARANCE_PRESETS.map((preset) => {
            const selected =
              draft.primary === preset.primary &&
              draft.secondary === preset.secondary;
            return (
              <button
                key={preset.id}
                type="button"
                className={[
                  "appearance-picker__preset",
                  selected ? "appearance-picker__preset--selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  commit({
                    primary: preset.primary,
                    secondary: preset.secondary,
                  })
                }
              >
                <span
                  className="appearance-picker__preset-swatches"
                  aria-hidden="true"
                >
                  <span style={{ background: preset.primary }} />
                  <span style={{ background: preset.secondary }} />
                </span>
                <span className="appearance-picker__preset-name">
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>

        <p className="appearance-picker__section-label">Custom colors</p>
        <div className="appearance-picker__fields">
          <ColorField
            id="appearance-primary"
            label="Primary"
            value={draft.primary}
            onChange={(primary) => commit({ ...draft, primary })}
          />
          <ColorField
            id="appearance-secondary"
            label="Secondary"
            value={draft.secondary}
            onChange={(secondary) => commit({ ...draft, secondary })}
          />
        </div>

        <div className="appearance-picker__footer">
          <button
            type="button"
            className="appearance-picker__reset"
            onClick={handleReset}
          >
            Reset to default
          </button>
          <button
            type="button"
            className="appearance-picker__done"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
