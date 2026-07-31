/**
 * Disaster Density Engine - i18n Dictionary Loader Utility
 * 辞書取得ユーティリティ
 */

import type { Locale, Dictionary } from './config';
import { locales, defaultLocale } from './config';
import { ja } from './dictionaries/ja';
import { en } from './dictionaries/en';

const dictionaries: Record<Locale, Dictionary> = {
  ja,
  en,
};

/**
 * 非同期 辞書取得関数 (Server Component 向け)
 */
export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  const validLocale = locales.includes(locale) ? locale : defaultLocale;
  return dictionaries[validLocale];
};

/**
 * 同期 辞書取得関数 (Client Component / Sync Event 向け)
 */
export const getDictionarySync = (locale: Locale): Dictionary => {
  const validLocale = locales.includes(locale) ? locale : defaultLocale;
  return dictionaries[validLocale];
};
