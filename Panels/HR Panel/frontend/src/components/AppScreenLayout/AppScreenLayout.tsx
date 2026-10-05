import type { ReactNode } from "react";
import "./AppScreenLayout.css";

export interface AppScreenLayoutProps {
  children: ReactNode;
}

export function AppScreenLayout({ children }: AppScreenLayoutProps) {
  return <main className="app-screen-layout">{children}</main>;
}
