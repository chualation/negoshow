
  import { StrictMode } from "react";
  import { createRoot } from "react-dom/client";

  import App from "./app/App";
  import { LanguageProvider } from "./i18n/LanguageContext";

  import "./styles/index.css";

  const rootElement = document.getElementById("root");

  if (!rootElement) {
    throw new Error("Root element was not found.");
  }

  createRoot(rootElement).render(
    <StrictMode>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </StrictMode>,
  );
  