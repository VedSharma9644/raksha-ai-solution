import { useState } from "react";
import type { TextFieldProps } from "../TextField";
import { TextField } from "../TextField";
import "./PasswordField.css";

export type PasswordFieldProps = Omit<TextFieldProps, "type">;

export function PasswordField({ className = "", ...rest }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={["password-field", className].filter(Boolean).join(" ")}>
      <TextField
        {...rest}
        type={isVisible ? "text" : "password"}
        autoComplete={rest.autoComplete ?? "current-password"}
      />
      <button
        type="button"
        className="password-field__toggle"
        onClick={() => setIsVisible((current) => !current)}
        aria-label={isVisible ? "Hide password" : "Show password"}
      >
        {isVisible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
