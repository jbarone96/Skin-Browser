import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
export type CurrencyCode = "USD" | "EUR" | "GBP";
export type LanguageCode = "en" | "de" | "fr";

export type LocaleOption = {
  label: string;
  short: string;
  value: string;
  language: LanguageCode;
  currency: CurrencyCode;
  flagCode: string;
  symbol: string;
};

export const localeOptions: LocaleOption[] = [
  {
    label: "English / USD",
    short: "EN / USD",
    value: "en-usd",
    language: "en",
    currency: "USD",
    flagCode: "us",
    symbol: "$",
  },
  {
    label: "English / EUR",
    short: "EN / EUR",
    value: "en-eur",
    language: "en",
    currency: "EUR",
    flagCode: "eu",
    symbol: "€",
  },
  {
    label: "English / GBP",
    short: "EN / GBP",
    value: "en-gbp",
    language: "en",
    currency: "GBP",
    flagCode: "gb",
    symbol: "£",
  },
  {
    label: "Deutsch / EUR",
    short: "DE / EUR",
    value: "de-eur",
    language: "de",
    currency: "EUR",
    flagCode: "de",
    symbol: "€",
  },
  {
    label: "Français / EUR",
    short: "FR / EUR",
    value: "fr-eur",
    language: "fr",
    currency: "EUR",
    flagCode: "fr",
    symbol: "€",
  },
];

type LocaleContextValue = {
  selectedLocale: LocaleOption;
  setSelectedLocale: (locale: LocaleOption) => void;
  formatPrice: (usdPrice: number) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = "skin-browser-locale";

// Temporary static rates. Later we can replace this with live FX.
const USD_TO_CURRENCY_RATE: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.93,
  GBP: 0.8,
};

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [selectedLocale, setSelectedLocaleState] = useState<LocaleOption>(
    localeOptions[0],
  );

  useEffect(() => {
    const savedLocale = localStorage.getItem(STORAGE_KEY);
    const matchedLocale = localeOptions.find(
      (option) => option.value === savedLocale,
    );

    if (matchedLocale) {
      setSelectedLocaleState(matchedLocale);
      return;
    }

    const browserLanguage = navigator.language.toLowerCase();

    if (browserLanguage.startsWith("de")) {
      setSelectedLocaleState(
        localeOptions.find((option) => option.value === "de-eur") ??
          localeOptions[0],
      );
      return;
    }

    if (browserLanguage.startsWith("fr")) {
      setSelectedLocaleState(
        localeOptions.find((option) => option.value === "fr-eur") ??
          localeOptions[0],
      );
      return;
    }

    if (browserLanguage.includes("gb") || browserLanguage.includes("uk")) {
      setSelectedLocaleState(
        localeOptions.find((option) => option.value === "en-gbp") ??
          localeOptions[0],
      );
      return;
    }

    if (
      browserLanguage.includes("de") ||
      browserLanguage.includes("fr") ||
      browserLanguage.includes("it") ||
      browserLanguage.includes("es") ||
      browserLanguage.includes("nl") ||
      browserLanguage.includes("pt")
    ) {
      setSelectedLocaleState(
        localeOptions.find((option) => option.value === "en-eur") ??
          localeOptions[0],
      );
      return;
    }

    setSelectedLocaleState(localeOptions[0]);
  }, []);

  function setSelectedLocale(locale: LocaleOption) {
    setSelectedLocaleState(locale);
    localStorage.setItem(STORAGE_KEY, locale.value);
  }

  function formatPrice(usdPrice: number) {
    const convertedPrice =
      usdPrice * USD_TO_CURRENCY_RATE[selectedLocale.currency];

    return new Intl.NumberFormat(selectedLocale.language, {
      style: "currency",
      currency: selectedLocale.currency,
      maximumFractionDigits: 2,
    }).format(convertedPrice);
  }

  const value = useMemo(
    () => ({
      selectedLocale,
      setSelectedLocale,
      formatPrice,
    }),
    [selectedLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used inside LocaleProvider");
  }

  return context;
}
