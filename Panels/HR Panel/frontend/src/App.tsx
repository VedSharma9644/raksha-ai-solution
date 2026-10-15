import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./app/AppRouter";
import { ConfirmDialogProvider } from "./components/ConfirmDialog";
import { AuthProvider } from "./features/authentication";
import { BranchProvider } from "./features/branches";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BranchProvider>
          <ConfirmDialogProvider>
            <AppRouter />
          </ConfirmDialogProvider>
        </BranchProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
