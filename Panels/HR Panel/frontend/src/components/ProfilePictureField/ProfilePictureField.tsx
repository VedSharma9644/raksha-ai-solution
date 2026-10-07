import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import "./ProfilePictureField.css";

export interface ProfilePictureFieldProps {
  /** Used to generate initials when no photo is selected */
  name?: string;
  /** Existing photo URL (e.g. from Firestore when editing) */
  currentUrl?: string;
  disabled?: boolean;
  onChange: (file: File) => void;
}

function getInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

export function ProfilePictureField({
  name = "",
  currentUrl = "",
  disabled = false,
  onChange,
}: ProfilePictureFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    onChange(file);
  }

  const displayUrl = previewUrl || currentUrl;

  return (
    <div className="profile-picture-field">
      <button
        type="button"
        className="profile-picture-field__circle"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        aria-label="Upload profile picture"
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Profile"
            className="profile-picture-field__img"
          />
        ) : (
          <span className="profile-picture-field__initials">
            {getInitials(name) || "👤"}
          </span>
        )}
        <span className="profile-picture-field__overlay">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </span>
      </button>
      <div className="profile-picture-field__label">
        <p className="profile-picture-field__title">Profile Photo</p>
        <p className="profile-picture-field__hint">Click to upload (JPG, PNG)</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
        disabled={disabled}
      />
    </div>
  );
}
