import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./app/AppRouter";
import { AuthProvider } from "./features/authentication";
import { BranchProvider } from "./features/branches";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BranchProvider>
          <AppRouter />
        </BranchProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
