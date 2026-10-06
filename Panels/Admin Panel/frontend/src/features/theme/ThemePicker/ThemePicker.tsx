import { useEffect, useId, useState } from "react";
import {
  THEME_OPTIONS,
  applyPageTheme,
  getSavedThemePreference,
  type ThemePreference,
} from "@raskha/shared";
import "./ThemePicker.css";

export interface ThemePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange?: (preference: ThemePreference) => void;
}

export function ThemePicker({
  isOpen,
  onClose,
  onThemeChange,
}: ThemePickerProps) {
  const titleId = useId();
  const [selected, setSelected] = useState<ThemePreference>(
    getSavedThemePreference
  );

  useEffect(() => {
    if (!isOpen) return;
    setSelected(getSavedThemePreference());
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

  function handleSelect(preference: ThemePreference) {
    setSelected(preference);
    applyPageTheme(preference);
    onThemeChange?.(preference);
  }

  return (
    <div className="theme-picker" role="presentation">
      <button
        type="button"
        className="theme-picker__backdrop"
        aria-label="Close theme picker"
        onClick={onClose}
      />

      <div
        className="theme-picker__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="theme-picker__header">
          <div>
            <h2 id={titleId} className="theme-picker__title">
              Theme
            </h2>
            <p className="theme-picker__support">
              System follows your device. Light and Dark stay fixed until you
              change them.
            </p>
          </div>
          <button
            type="button"
            className="theme-picker__close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div
          className="theme-picker__options"
          role="radiogroup"
          aria-label="Theme preference"
        >
          {THEME_OPTIONS.map((option) => {
            const isSelected = option.id === selected;
            return (
              <button
                key={option.id}
                type="button"
                className={[
                  "theme-picker__option",
                  isSelected ? "theme-picker__option--selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelect(option.id)}
              >
                <span className="theme-picker__option-copy">
                  <span className="theme-picker__option-label">
                    {option.label}
                  </span>
                  <span className="theme-picker__option-description">
                    {option.description}
                  </span>
                </span>
                {isSelected ? (
                  <span className="theme-picker__check" aria-hidden="true">
                    ✓
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
