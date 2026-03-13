import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/common.json';
import zh from './locales/zh/common.json';
import ko from './locales/ko/common.json';
import de from './locales/de/common.json';
import ru from './locales/ru/common.json';
import fr from './locales/fr/common.json';
import es from './locales/es/common.json';
import pt from './locales/pt/common.json';

const STORAGE_KEY = 'language';

function normalizeLanguage(
  value: string | null | undefined
): 'zh' | 'en' | 'ko' | 'de' | 'ru' | 'fr' | 'es' | 'pt' {
  if (!value) return 'zh';
  const lower = value.toLowerCase();
  if (lower.startsWith('en')) return 'en';
  if (lower.startsWith('zh')) return 'zh';
  if (lower.startsWith('ko')) return 'ko';
  if (lower.startsWith('de')) return 'de';
  if (lower.startsWith('ru')) return 'ru';
  if (lower.startsWith('fr')) return 'fr';
  if (lower.startsWith('es')) return 'es';
  if (lower.startsWith('pt')) return 'pt';
  return 'zh';
}

function getInitialLanguage(): 'zh' | 'en' | 'ko' | 'de' | 'ru' | 'fr' | 'es' | 'pt' {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return normalizeLanguage(saved);
  } catch {
  }
  return normalizeLanguage(typeof navigator !== 'undefined' ? navigator.language : 'zh');
}

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
    ko: { translation: ko },
    de: { translation: de },
    ru: { translation: ru },
    fr: { translation: fr },
    es: { translation: es },
    pt: { translation: pt },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'zh',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  const normalized = normalizeLanguage(lng);
  document.documentElement.lang = normalized;
  try {
    localStorage.setItem(STORAGE_KEY, normalized);
  } catch {
  }
});

document.documentElement.lang = normalizeLanguage(i18n.language);

export default i18n;
