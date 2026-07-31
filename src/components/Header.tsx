/**
 * Header Component
 * 多言語対応メインヘッダーコンポーネント
 */

import React from 'react';
import type { Locale, Dictionary } from '../i18n/config';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  currentLocale: Locale;
  onLocaleChange: (locale: Locale) => void;
  dict: Dictionary;
}

export const Header: React.FC<HeaderProps> = ({ currentLocale, onLocaleChange, dict }) => {
  return (
    <header className="main-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
      <div className="brand">
        <div className="brand-icon">⚡</div>
        <div>
          <h1>{dict.common.title}</h1>
          <p className="subtitle">{dict.common.subtitle}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="header-badges">
          <span className="badge status-live"><span className="dot"></span> {dict.common.statusLive}</span>
          <span className="badge tech-tag">{dict.common.jisDynamicMatch}</span>
          <span className="badge gov-tag">{dict.common.govIntegration}</span>
        </div>

        <LanguageSwitcher
          currentLocale={currentLocale}
          onLocaleChange={onLocaleChange}
          dict={dict}
        />
      </div>
    </header>
  );
};
