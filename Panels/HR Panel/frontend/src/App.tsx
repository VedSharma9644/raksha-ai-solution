import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./app/AppRouter";
import { ConfirmDialogProvider } from "./components/ConfirmDialog";
import { AuthProvider } from "./features/authentication";
import { BranchProvider } from "./features/branches";
import { HrWebOpsProvider } from "./features/webOps/HrWebOpsProvider";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BranchProvider>
          <HrWebOpsProvider>
            <ConfirmDialogProvider>
              <AppRouter />
            </ConfirmDialogProvider>
          </HrWebOpsProvider>
        </BranchProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
