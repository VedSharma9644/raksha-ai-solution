import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  bootstrapPageAppearance,
  bootstrapPageLanguage,
  bootstrapPageTheme,
} from "@raskha/shared";
import App from "./App.tsx";
import "./styles/global.css";

bootstrapPageTheme();
bootstrapPageAppearance();
bootstrapPageLanguage();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
