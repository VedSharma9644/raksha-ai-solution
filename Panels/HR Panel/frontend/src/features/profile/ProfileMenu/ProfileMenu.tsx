import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSavedAppearanceLabel,
  getSavedLanguageLabel,
  getSavedThemeLabel,
} from "@raskha/shared";
import { APP_ROUTES } from "../../../app/routePaths";
import { AppearancePicker } from "../../appearance";
import { useAuthContext } from "../../authentication";
import { LanguagePicker } from "../../language";
import { ThemePicker } from "../../theme";
import "./ProfileMenu.css";

export function ProfileMenu() {
  const navigate = useNavigate();
  const { hrStaff, logout } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [appearanceLabel, setAppearanceLabel] = useState(getSavedAppearanceLabel);
  const [languageLabel, setLanguageLabel] = useState(getSavedLanguageLabel);
  const [themeLabel, setThemeLabel] = useState(getSavedThemeLabel);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownId = useId();

  const displayName = hrStaff?.fullName?.trim() || "HR account";
  const email = hrStaff?.email?.trim() || "";

  useEffect(() => {
    setAppearanceLabel(getSavedAppearanceLabel());
  }, [isAppearanceOpen]);

  useEffect(() => {
    setLanguageLabel(getSavedLanguageLabel());
  }, [isLanguageOpen]);

  useEffect(() => {
    setThemeLabel(getSavedThemeLabel());
  }, [isThemeOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setIsOpen(false);
    try {
      await logout();
      navigate(APP_ROUTES.login, { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <div className="profile-menu" ref={menuRef}>
        <button
          type="button"
          className="profile-menu__trigger"
          aria-label="Profile menu"
          aria-expanded={isOpen}
          aria-controls={dropdownId}
          aria-haspopup="menu"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="profile-menu__avatar" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="8"
                r="3.5"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M5.5 19.5c1.6-3.2 4-4.8 6.5-4.8s4.9 1.6 6.5 4.8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="profile-menu__trigger-text">Profile</span>
        </button>

        {isOpen ? (
          <div
            id={dropdownId}
            className="profile-menu__dropdown"
            role="menu"
            aria-label="Profile options"
          >
            <div className="profile-menu__identity">
              <p className="profile-menu__name">{displayName}</p>
              {email ? <p className="profile-menu__email">{email}</p> : null}
            </div>

            <div className="profile-menu__section" role="none">
              <button
                type="button"
                className="profile-menu__item"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  setIsAppearanceOpen(true);
                }}
              >
                <span>Appearance</span>
                <span className="profile-menu__item-meta">{appearanceLabel}</span>
              </button>

              <button
                type="button"
                className="profile-menu__item"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  setIsThemeOpen(true);
                }}
              >
                <span>Theme</span>
                <span className="profile-menu__item-meta">{themeLabel}</span>
              </button>

              <button
                type="button"
                className="profile-menu__item"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  setIsLanguageOpen(true);
                }}
              >
                <span>Language</span>
                <span className="profile-menu__item-meta">{languageLabel}</span>
              </button>
            </div>

            <div className="profile-menu__divider" role="separator" />

            <button
              type="button"
              className="profile-menu__item profile-menu__item--danger"
              role="menuitem"
              disabled={isLoggingOut}
              onClick={() => void handleLogout()}
            >
              {isLoggingOut ? "Signing out…" : "Log out"}
            </button>
          </div>
        ) : null}
      </div>

      <AppearancePicker
        isOpen={isAppearanceOpen}
        onClose={() => setIsAppearanceOpen(false)}
        onAppearanceChange={() => setAppearanceLabel(getSavedAppearanceLabel())}
      />

      <ThemePicker
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        onThemeChange={() => setThemeLabel(getSavedThemeLabel())}
      />

      <LanguagePicker
        isOpen={isLanguageOpen}
        onClose={() => setIsLanguageOpen(false)}
      />
    </>
  );
}
