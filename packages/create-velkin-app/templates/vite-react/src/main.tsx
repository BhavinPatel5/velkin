import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@velkin/ui/theme-provider/default.css";
import { VuThemeProvider } from "@velkin/react/theme-provider";
import { App } from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VuThemeProvider persist>
      <App />
    </VuThemeProvider>
  </StrictMode>,
);
