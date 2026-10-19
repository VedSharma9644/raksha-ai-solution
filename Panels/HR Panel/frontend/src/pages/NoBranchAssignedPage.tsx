import { useAuthContext } from "../features/authentication";
import { AppScreenLayout } from "../components/AppScreenLayout";
import "./BranchSelectionPage.css";

export function NoBranchAssignedPage() {
  const { logout } = useAuthContext();

  return (
    <AppScreenLayout showWorkingBranch={false}>
      <div className="branch-selection-page">
        <div className="branch-selection-page__card">
          <div className="branch-selection-page__header">
            <p className="branch-selection-page__brand">Raskha</p>
            <h1 className="branch-selection-page__title">No Branch Assigned</h1>
            <p className="branch-selection-page__subtitle">
              Your account is not linked to any active branch yet. Ask your agency
              admin to assign you to a branch, then sign in again.
            </p>
          </div>
          <button
            type="button"
            className="branch-selection-page__branch-btn"
            onClick={() => void logout()}
          >
            Sign out
          </button>
        </div>
      </div>
    </AppScreenLayout>
  );
}
