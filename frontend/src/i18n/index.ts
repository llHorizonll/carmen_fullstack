import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

import en from "./locales/en.json"
import th from "./locales/th.json"
import vi from "./locales/vi.json"

// The translations
const resources = {
  en: { translation: en },
  th: { translation: th },
  vi: { translation: vi },
}

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: "en",
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "carmen-language",
    },
  })

export default i18n
