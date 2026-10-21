import type { ReactNode } from "react";
import { WorkingBranchBar } from "../WorkingBranchBar";
import "./AppScreenLayout.css";

export interface AppScreenLayoutProps {
  children: ReactNode;
  /** When false, hides the sticky branch chip (e.g. login). Default true. */
  showWorkingBranch?: boolean;
}

export function AppScreenLayout({
  children,
  /** Branch lives in AdminAppShell top bar — off by default. */
  showWorkingBranch = false,
}: AppScreenLayoutProps) {
  return (
    <main className="app-screen-layout">
      {showWorkingBranch ? (
        <div className="app-screen-layout__branch-bar">
          <WorkingBranchBar />
        </div>
      ) : null}
      {children}
    </main>
  );
}
