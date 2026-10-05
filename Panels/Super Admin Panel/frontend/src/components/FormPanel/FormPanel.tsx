import type { ReactNode } from "react";
import "./FormPanel.css";

export interface FormPanelProps {
  children: ReactNode;
  className?: string;
}

export function FormPanel({ children, className = "" }: FormPanelProps) {
  return (
    <div className={["form-panel", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
