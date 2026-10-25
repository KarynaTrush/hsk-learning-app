import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import pl from "./locales/pl.json";
import ru from "./locales/ru.json";
import en from "./locales/en.json";

export const LANG_STORAGE_KEY = "hsk_lang";

export const LANG_CODES = {
  EN: "en",
  RU: "ru",
  PL: "pl",
};

export const CODE_TO_LABEL = {
  en: "EN",
  ru: "RU",
  pl: "PL",
};

export const DATE_LOCALES = {
  en: "en-GB",
  ru: "ru-RU",
  pl: "pl-PL",
};

const saved = typeof window !== "undefined" ? localStorage.getItem(LANG_STORAGE_KEY) : null;
const initialLng = saved && ["en", "ru", "pl"].includes(saved) ? saved : "ru";

i18n.use(initReactI18next).init({
  resources: {
    pl: { translation: pl },
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: initialLng,
  fallbackLng: "ru",
  interpolation: { escapeValue: false },
});

document.documentElement.lang = initialLng;
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
  localStorage.setItem(LANG_STORAGE_KEY, lng);
});

export default i18n;
