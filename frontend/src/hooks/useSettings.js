import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'app_settings';

const DEFAULTS = {
  theme: 'system',   // 'light' | 'dark' | 'system'
  language: 'zh-TW', // 'zh-TW' | 'en'
};

export function getStoredSettings() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? { ...DEFAULTS, ...JSON.parse(s) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(getStoredSettings);

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  const update = useCallback((key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { settings, update };
}
