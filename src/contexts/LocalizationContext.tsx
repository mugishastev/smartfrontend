import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Language, Currency, LocalizationData } from "@/lib/types";
import { getLocalizationData } from "@/lib/api";

type LocalizationContextValue = {
  languages: Language[];
  currencies: Currency[];
  selectedLanguage: Language | null;
  selectedCurrency: Currency | null;
  loading: boolean;
  setLanguage: (code: string) => void;
  setCurrency: (code: string) => void;
};

const LocalizationContext = createContext<LocalizationContextValue | undefined>(undefined);

const LOCAL_STORAGE_LANGUAGE = "scoh_language";
const LOCAL_STORAGE_CURRENCY = "scoh_currency";

export const LocalizationProvider = ({ children }: { children: React.ReactNode }) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);

  useEffect(() => {
    const loadLocalization = async () => {
      setLoading(true);
      try {
        const response = await getLocalizationData();
        const payload: LocalizationData = response.data;
        setLanguages(payload.languages);
        setCurrencies(payload.currencies);

        const storedLang = localStorage.getItem(LOCAL_STORAGE_LANGUAGE);
        const storedCurrency = localStorage.getItem(LOCAL_STORAGE_CURRENCY);

        const resolvedLanguage =
          payload.languages.find((lang) => lang.code === storedLang) ??
          payload.languages.find((lang) => lang.isDefault) ??
          payload.languages[0] ??
          null;

        const resolvedCurrency =
          payload.currencies.find((cur) => cur.code === storedCurrency) ??
          payload.currencies[0] ??
          null;

        setSelectedLanguage(resolvedLanguage);
        setSelectedCurrency(resolvedCurrency);
      } catch (error) {
        console.warn("Failed to load localization data", error);
      } finally {
        setLoading(false);
      }
    };
    loadLocalization();
  }, []);

  const setLanguage = (code: string) => {
    const lang = languages.find((language) => language.code === code);
    if (lang) {
      setSelectedLanguage(lang);
      localStorage.setItem(LOCAL_STORAGE_LANGUAGE, code);
    }
  };

  const setCurrency = (code: string) => {
    const currency = currencies.find((cur) => cur.code === code);
    if (currency) {
      setSelectedCurrency(currency);
      localStorage.setItem(LOCAL_STORAGE_CURRENCY, code);
    }
  };

  const value = useMemo(
    () => ({
      languages,
      currencies,
      selectedLanguage,
      selectedCurrency,
      loading,
      setLanguage,
      setCurrency,
    }),
    [languages, currencies, selectedCurrency, selectedLanguage, loading]
  );

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
};

export const useLocalization = (): LocalizationContextValue => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error("useLocalization must be used within LocalizationProvider");
  }
  return context;
};
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Currency, Language, LocalizationData } from "@/lib/types";
import { getLocalizationData } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

type LocalizationContextValue = {
  languages: Language[];
  currencies: Currency[];
  selectedLanguage: Language | null;
  selectedCurrency: Currency | null;
  setLanguage: (code: string) => void;
  setCurrency: (code: string) => void;
  refresh: () => Promise<void>;
};

const LocalizationContext = createContext<LocalizationContextValue | undefined>(undefined);

const LANGUAGE_KEY = "app_language";
const CURRENCY_KEY = "app_currency";

export const LocalizationProvider = ({ children }: { children: React.ReactNode }) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [preferredLanguage, setPreferredLanguage] = useState<string | null>(() => localStorage.getItem(LANGUAGE_KEY));
  const [preferredCurrency, setPreferredCurrency] = useState<string | null>(() => localStorage.getItem(CURRENCY_KEY));
  const { toast } = useToast();

  const refresh = async () => {
    try {
      const response = await getLocalizationData();
      setLanguages(response.data.languages ?? []);
      setCurrencies(response.data.currencies ?? []);
    } catch (error: any) {
      console.error("Failed to load localization data", error);
      toast({
        variant: "destructive",
        title: "Localization Error",
        description: error?.message || "Unable to load languages and currencies",
      });
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const selectedLanguage = useMemo(() => {
    if (!languages.length) return null;
    return languages.find((lang) => lang.code === preferredLanguage) ?? languages.find((lang) => lang.isDefault) ?? languages[0];
  }, [languages, preferredLanguage]);

  const selectedCurrency = useMemo(() => {
    if (!currencies.length) return null;
    return currencies.find((currency) => currency.code === preferredCurrency) ?? currencies[0];
  }, [currencies, preferredCurrency]);

  const setLanguage = (code: string) => {
    setPreferredLanguage(code);
    localStorage.setItem(LANGUAGE_KEY, code);
  };

  const setCurrency = (code: string) => {
    setPreferredCurrency(code);
    localStorage.setItem(CURRENCY_KEY, code);
  };

  return (
    <LocalizationContext.Provider
      value={{
        languages,
        currencies,
        selectedLanguage,
        selectedCurrency,
        setLanguage,
        setCurrency,
        refresh,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextValue => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error("useLocalization must be used within LocalizationProvider");
  }
  return context;
};

