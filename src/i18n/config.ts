/**
 * Disaster Density Engine - i18n System Configuration
 * 多言語対応システム設定 (型安全な DeepStringMap 設定)
 */

import { ja } from './dictionaries/ja';

export const locales = ['ja', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ja';

/**
 * as const で定義された ja.ts のキー構造・階層構造を100%保持しつつ、
 * 値を string 型として型安全に強制する DeepStringMap 導出型
 */
export type DeepStringMap<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : DeepStringMap<T[K]>;
};

export type Dictionary = DeepStringMap<typeof ja>;
