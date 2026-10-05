import type { ReactNode } from "react";
import { Button } from "../Button";
import "./PageHeader.css";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  onBack,
  backLabel = "Back",
  actions,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__copy">
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            size="medium"
            className="page-header__back"
            onClick={onBack}
          >
            ← {backLabel}
          </Button>
        ) : null}
        <h1 className="page-header__title">{title}</h1>
        {subtitle ? <p className="page-header__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  );
}
