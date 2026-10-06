import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  APP_LANGUAGES,
  applyPageLanguage,
  filterLanguages,
  getSavedLanguageId,
} from "@raskha/shared";
import "./LanguagePicker.css";

export interface LanguagePickerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LanguagePicker({ isOpen, onClose }: LanguagePickerProps) {
  const titleId = useId();
  const searchId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(getSavedLanguageId);
  const [isApplying, setIsApplying] = useState(false);

  const filtered = useMemo(
    () => filterLanguages(APP_LANGUAGES, query),
    [query]
  );

  useEffect(() => {
    if (!isOpen) return;
    setQuery("");
    setSelectedId(getSavedLanguageId());
    const timer = window.setTimeout(() => searchRef.current?.focus(), 30);
    return () => window.clearTimeout(timer);
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

  function handleApply(languageId: string) {
    if (isApplying) return;
    setIsApplying(true);
    setSelectedId(languageId);
    applyPageLanguage(languageId);
  }

  return (
    <div className="language-picker" role="presentation">
      <button
        type="button"
        className="language-picker__backdrop"
        aria-label="Close language picker"
        onClick={onClose}
      />

      <div
        className="language-picker__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="language-picker__header">
          <div>
            <h2 id={titleId} className="language-picker__title">
              Language
            </h2>
            <p className="language-picker__support">
              Choose a regional Indian language. The page is translated in your
              browser using Google Translate.
            </p>
          </div>
          <button
            type="button"
            className="language-picker__close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <label className="language-picker__search-label" htmlFor={searchId}>
          Search languages
        </label>
        <input
          ref={searchRef}
          id={searchId}
          className="language-picker__search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Hindi, தமிழ், বাংলা…"
          autoComplete="off"
        />

        <ul className="language-picker__list" role="listbox" aria-label="Languages">
          {filtered.length === 0 ? (
            <li className="language-picker__empty">No languages match your search.</li>
          ) : (
            filtered.map((language) => {
              const isSelected = language.id === selectedId;
              const canTranslate = Boolean(language.googleCode);
              return (
                <li key={language.id}>
                  <button
                    type="button"
                    className={[
                      "language-picker__option",
                      isSelected ? "language-picker__option--selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    role="option"
                    aria-selected={isSelected}
                    disabled={isApplying}
                    onClick={() => handleApply(language.id)}
                  >
                    <span className="language-picker__option-copy">
                      <span className="language-picker__option-name">
                        {language.name}
                      </span>
                      <span className="language-picker__option-native">
                        {language.nativeName}
                      </span>
                      {!canTranslate ? (
                        <span className="language-picker__option-note">
                          Preference only — auto-translate unavailable
                        </span>
                      ) : null}
                    </span>
                    {isSelected ? (
                      <span className="language-picker__check" aria-hidden="true">
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
    </div>
  );
}
