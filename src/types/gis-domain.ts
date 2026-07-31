/**
 * Disaster Density Engine - GIS & Disaster Risk Reduction (DRR) Domain Types
 * 防災・GIS領域専門ドメイン型定義
 */

/**
 * 被害種別コード (Disaster Damage Category Metric)
 */
export type DamageType = 'collapsed_houses' | 'water_outage' | 'evacuees' | 'infrastructure_damage';

/**
 * 避難指示レベル区分 (Evacuation Alert Level)
 */
export type EvacuationLevel = 'evacuation_order' | 'evacuation_advisory' | 'evacuation_vulnerable';

/**
 * 重症度ランク (Severity Index Classification)
 * - CRITICAL: 密度 15% 以上 (極めて致命的)
 * - SEVERE: 密度 5% 以上 15% 未満 (深刻)
 * - MODERATE: 密度 1% 以上 5% 未満 (中規模)
 * - LIGHT: 密度 1% 未満 (軽微)
 */
export type SeverityRank = 'CRITICAL' | 'SEVERE' | 'MODERATE' | 'LIGHT';

/**
 * 可視化モード (Dual-Mode Visualizer View)
 * - relative: 被害密度 (%) モード (相対数)
 * - absolute: 被害規模 (棟/戸/人) モード (絶対数)
 */
export type VisualizerMode = 'relative' | 'absolute';

/**
 * 総務省 5桁 JIS 自治体コード (Japanese Industrial Standards Municipality Code)
 */
export type JISCode = string;

/**
 * GIS マップレイヤー指標型 (GIS Layer Domain Metric)
 */
export interface GISLayerMetrics {
  damageDensity: number;       // 被害密度 (Disaster Impact Density)
  inundationDepth?: number;    // 浸水深 (Inundation Depth in meters)
  seismicIntensity?: string;   // 震度 (JMA Seismic Intensity Scale)
  populationDensity?: number;  // 人口密度 (Population Density per km²)
}

/**
 * 災害情報・リスク解析指標 (Disaster Impact Analysis Model)
 */
export interface DisasterImpactModel {
  evacuationOrder: boolean;         // 避難指示 (Evacuation Order)
  evacuationAdvisory?: boolean;     // 避難指示相当 / 旧避難勧告 (Evacuation Advisory)
  evacuationVulnerable?: boolean;   // 高齢者等避難 (Evacuation of Vulnerable People)
  evacuationCenterCount?: number;   // 避難所数 (Evacuation Center / Shelter)
  estimatedDamage: number;          // 想定被害 / 予測被害 (Estimated Damage / Projected Impact)
  damageRatio: number;              // 被害率・被害割合 (Damage Ratio %)
  buildingCollapseRate: number;     // 建物倒壊率 (Building Collapse Rate %)
  isPotentiallyIsolatedArea: boolean; // 孤立可能性地域 (Potentially Isolated Area)
}

/**
 * 自治体統計分母マスター (Point-in-Time Municipality Census Denominator)
 */
export interface MunicipalityCensusBase {
  jisCode: JISCode;
  prefectureJa: string;
  prefectureEn: string;
  cityNameJa: string;
  cityNameEn: string;
  totalHouseholds: number;
  totalPopulation: number;
  totalBuildings: number;
  totalBaseYear: number; // 例: 2016, 2024, 2026
}

/**
 * 被害密度解析メトリクス (Damage Density Analytics Metric)
 */
export interface DamageMetric {
  damageType: DamageType;
  damageLabelJa: string;
  damageLabelEn: string;
  absoluteCount: number;         // 分子: 報道被害絶対数
  totalBase: number;             // 分母: 自治体全体数
  totalBaseYear: number;         // 分母参照年次 (Point-in-Time)
  relativeRatePercent: number;   // 被害密度 (%) [capped at 100%]
  severityRank: SeverityRank;    // 重症度ランク
}

/**
 * 名寄せ済み自治体データ (Resolved Municipality Entity)
 */
export interface ResolvedMunicipalityEntity {
  jisCode: JISCode;
  prefecture: string;
  cityName: string;
  metrics: DamageMetric;
  rawSentence?: string;
  timestamp: string;
}

/**
 * 時系列 Point-in-Time 解決メタデータ (Synchronized Point-in-Time Resolution)
 */
export interface PointInTimeResolution {
  disasterOccurrenceYear: number; // 災害発生年
  totalBaseYear: number;          // 引き当て適用統計年次
  isSynchronized: boolean;        // 時系列同期完了フラグ
}

/**
 * 災害報道速報・報数メタデータ (Dynamic Disaster Report Bulletin)
 */
export interface DisasterReportBulletin {
  id: string;
  source: string;
  title: string;
  disasterName: string;
  reportNumber: number;          // 報数 N (第N報)
  isLatest: boolean;             // 同一災害内 N_max 最新フラグ
  timestamp: string;
  url: string;
  keywords: string[];
}
