import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./ActionCard.css";

export interface ActionCardProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  title: string;
  description: string;
  icon?: ReactNode;
}

export function ActionCard({
  title,
  description,
  icon,
  className = "",
  type = "button",
  ...rest
}: ActionCardProps) {
  const classes = ["action-card", className].filter(Boolean).join(" ");

  return (
    <button type={type} className={classes} {...rest}>
      {icon ? <span className="action-card__icon">{icon}</span> : null}
      <span className="action-card__title">{title}</span>
      <span className="action-card__description">{description}</span>
    </button>
  );
}
