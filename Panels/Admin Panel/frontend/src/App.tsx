import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./app/AppRouter";
import { ConfirmDialogProvider } from "./components/ConfirmDialog";
import { AuthProvider } from "./features/authentication";
import { BranchProvider } from "./features/branches";
import { AdminWebOpsProvider } from "./features/webOps/AdminWebOpsProvider";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BranchProvider>
          <AdminWebOpsProvider>
            <ConfirmDialogProvider>
              <AppRouter />
            </ConfirmDialogProvider>
          </AdminWebOpsProvider>
        </BranchProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
