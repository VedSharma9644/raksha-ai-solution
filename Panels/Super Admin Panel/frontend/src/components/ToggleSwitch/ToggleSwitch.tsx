import { useId } from "react";
import "./ToggleSwitch.css";

export interface ToggleSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleSwitch({
  label,
  description,
  checked,
  disabled = false,
  onChange,
}: ToggleSwitchProps) {
  const switchId = useId();

  return (
    <label
      className={[
        "toggle-switch",
        disabled ? "toggle-switch--disabled" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      htmlFor={switchId}
    >
      <span className="toggle-switch__copy">
        <span className="toggle-switch__label">{label}</span>
        {description ? (
          <span className="toggle-switch__description">{description}</span>
        ) : null}
      </span>
      <input
        id={switchId}
        className="toggle-switch__input"
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        aria-checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="toggle-switch__track" aria-hidden="true">
        <span className="toggle-switch__thumb" />
      </span>
    </label>
  );
}
