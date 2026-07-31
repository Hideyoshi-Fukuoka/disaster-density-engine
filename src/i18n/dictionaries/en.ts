/**
 * Disaster Density Engine - English Dictionary (en.ts)
 * `Dictionary` (jaのキー構造) による完全な型適合・キー完備の強制
 */

import type { Dictionary } from "../config";

export const en: Dictionary = {
  common: {
    title: "Disaster Density Engine",
    subtitle: "Disaster Impact & Damage Density Visualization Engine",
    language: "Language",
    statusLive: "Live Engine",
    jisDynamicMatch: "Dynamic JIS Code Match",
    govIntegration: "🏛️ MIC / FDMA Data Pipeline",
  },
  gis: {
    layers: "Map Layers",
    damageDensity: "Disaster Impact Density",
    inundationDepth: "Inundation Depth",
    seismicIntensity: "Seismic Intensity",
    populationDensity: "Population Density",
    pointInTimeResolution: "Point-in-Time Census Resolution",
    entityResolution: "Entity Resolution & JIS Normalization",
  },
  disasterInfo: {
    evacuationOrder: "Evacuation Order",
    evacuationAdvisory: "Evacuation Advisory",
    evacuationVulnerable: "Evacuation of Vulnerable People",
    evacuationCenter: "Evacuation Center / Shelter",
    estimatedDamage: "Estimated Damage / Projected Impact",
    damageRatio: "Damage Ratio (%)",
    collapseRate: "Building Collapse Rate",
    isolatedAreas: "Potentially Isolated Areas",
  },
  metrics: {
    unitDensity: "cases/km²",
    unitRatio: "%",
    collapsedHouses: "Structural Collapse / Destroyed Homes",
    waterOutage: "Water Service Disruption",
    evacuees: "Displaced Persons / Evacuees",
    infrastructure: "Critical Infrastructure Damage",
  },
  inputPanel: {
    title: "Disaster Reports & Government Bulletins",
    hint: "Input Unstructured Disaster Text",
    govFetchLabel: "🏛️ Live Search & Automated Fetch for MIC / FDMA Bulletins:",
    govSearchPlaceholder: "Search by keyword, bulletin #, or URL (e.g., Kumamoto Earthquake, Bulletin #14, #15)",
    govSearchBtn: "🔍 Search",
    govSelectDefault: "-- Select Target Bulletin / Announcement --",
    govFetchBtn: "Fetch & Analyze ⚡",
    disasterNameLabel: "Disaster Name / Headline",
    disasterNamePlaceholder: "e.g., 2026 Reiwa 8 Kumamoto Earthquake Emergency Report",
    inputTextLabel: "Unstructured Damage Report Body Text",
    inputTextPlaceholder: "Please enter disaster news report or official bulletin text.",
    parseBtn: "⚡ Parse & Calculate Impact Density Ratio (%)",
  },
  visualizer: {
    title: "Dual-Mode Visualizer",
    description: "Switch between Absolute Damage Magnitude & Relative Impact Density (%)",
    modeRelative: "🔥 Impact Density (%) Mode",
    modeRelativeSub: "(Relative Rate)",
    modeAbsolute: "🏢 Absolute Magnitude Mode",
    modeAbsoluteSub: "(Absolute Count)",
    filterLabel: "Damage Category Filter:",
    filterAll: "Show All Categories",
    statAnalyzed: "Municipalities Analyzed:",
    statMaxDensity: "Peak Impact Municipality:",
    statPointInTime: "Point-in-Time Baseline Year:",
  },
  table: {
    tabTable: "📋 Municipal Damage Density Analytics Table",
    tabJson: "{ } Output JSON Schema (API Payload)",
    jisCode: "JIS Code",
    prefecture: "Prefecture",
    cityName: "Municipality Name",
    damageType: "Damage Category",
    absoluteCount: "Absolute Count (Numerator)",
    totalBase: "Municipal Baseline (Denominator)",
    totalBaseYear: "Baseline Census Year",
    relativeRatePercent: "Impact Density (%)",
    severityRank: "Severity Rank",
  },
  severityRanks: {
    CRITICAL: "CRITICAL (≥ 15% Ratio)",
    SEVERE: "SEVERE (5% - 15% Ratio)",
    MODERATE: "MODERATE (1% - 5% Ratio)",
    LIGHT: "LIGHT (< 1% Ratio)",
  },
  jsonViewer: {
    copyBtn: "📋 Copy JSON Payload",
    copiedText: "✅ Copied to Clipboard!",
    badge: "Output JSON Schema (Required Format)",
    placeholder: "/* Click parse button to display output JSON payload here */",
  },
  footer: {
    copyright: "Disaster-Density-Engine © 2026 | Disaster Damage Dynamic Density Analytics Platform",
  },
};
