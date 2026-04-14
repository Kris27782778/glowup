import { useState, useEffect, useCallback } from 'react';
import en from '../i18n';
import { getStoredSettings } from './useSettings';

export function useLang() {
  const [lang, setLang] = useState(() => getStoredSettings().language);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.key === 'language') setLang(e.detail.value);
    };
    window.addEventListener('glow-settings', handler);
    return () => window.removeEventListener('glow-settings', handler);
  }, []);

  const t = useCallback((key) => {
    if (!key) return key;
    if (lang === 'zh-TW') return key;
    return en[key] ?? key;
  }, [lang]);

  return { lang, t };
}
