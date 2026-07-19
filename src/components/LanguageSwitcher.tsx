import { Languages } from "lucide-react";

import { useLanguage } from "../i18n/LanguageContext";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="inline-flex rounded-full border border-border bg-card p-1"
      aria-label="Language selector"
    >
      <button
        type="button"
        onClick={() => setLanguage("fil")}
        className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
          language === "fil"
            ? "bg-primary text-white"
            : "text-muted-foreground"
        }`}
        aria-pressed={language === "fil"}
      >
        FIL
      </button>

      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
          language === "en"
            ? "bg-primary text-white"
            : "text-muted-foreground"
        }`}
        aria-pressed={language === "en"}
      >
        ENG
      </button>

      <span className="sr-only">
        <Languages />
      </span>
    </div>
  );
}
