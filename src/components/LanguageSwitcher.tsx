/**
 * Language Switcher Component
 * 言語切替 UI コンポーネント
 */

import React from 'react';
import type { Locale, Dictionary } from '../i18n/config';

interface LanguageSwitcherProps {
  currentLocale: Locale;
  onLocaleChange: (locale: Locale) => void;
  dict: Dictionary;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLocale,
  onLocaleChange,
  dict,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onLocaleChange(e.target.value as Locale);
  };

  return (
    <div className="language-switcher" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <label htmlFor="languageSelect" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted, #94a3b8)', whiteSpace: 'nowrap' }}>
        🌐 {dict.common.language}:
      </label>
      <select
        id="languageSelect"
        value={currentLocale}
        onChange={handleChange}
        style={{
          padding: '4px 8px',
          borderRadius: '6px',
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          color: '#f8fafc',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          cursor: 'pointer',
          fontSize: '0.85rem',
        }}
      >
        <option value="ja">日本語 (JA)</option>
        <option value="en">English (EN)</option>
      </select>
    </div>
  );
};
