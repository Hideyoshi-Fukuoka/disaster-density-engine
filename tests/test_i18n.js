/**
 * i18n System Architecture & Domain Glossary Integration Verification Test
 * 多言語対応システム・辞書構造・型適合性検証テスト
 */

const assert = require('assert');

// 辞書オブジェクトとユーティリティの読み込み
const { ja } = require('../src/i18n/dictionaries/ja');
const { en } = require('../src/i18n/dictionaries/en');
const { getDictionarySync } = require('../src/i18n/get-dictionary');

console.log('=== Disaster Density Engine - Strict Type-Safe i18n Test ===\n');

let passed = true;

// 1. キー構造の完全に再帰的な一致比較関数
function getObjectKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys = keys.concat(getObjectKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
  }
  return keys;
}

const jaKeys = getObjectKeys(ja).sort();
const enKeys = getObjectKeys(en).sort();

console.log(`[Test 1] Verifying Dictionary Key Integrity (typeof ja === typeof en)...`);
console.log(`  - Japanese Keys Count: ${jaKeys.length}`);
console.log(`  - English Keys Count:  ${enKeys.length}`);

try {
  assert.deepStrictEqual(jaKeys, enKeys, 'Japanese and English dictionary key structures do not match!');
  console.log('  ✅ SUCCESS: ja.ts and en.ts have 100% identical type-safe key structures.\n');
} catch (err) {
  console.error('  ❌ FAILED: Key structure mismatch between ja.ts and en.ts!');
  console.error(err.message);
  passed = false;
}

// 2. 指定ドメイン対訳 (Disaster & GIS Domain Glossary) の検証
console.log('[Test 2] Verifying Mandatory Disaster & GIS Glossary Translations...');
const glossaryChecks = [
  { path: 'gis.damageDensity', expectedEn: 'Disaster Impact Density' },
  { path: 'gis.inundationDepth', expectedEn: 'Inundation Depth' },
  { path: 'gis.seismicIntensity', expectedEn: 'Seismic Intensity' },
  { path: 'gis.populationDensity', expectedEn: 'Population Density' },
  { path: 'disasterInfo.evacuationOrder', expectedEn: 'Evacuation Order' },
  { path: 'disasterInfo.evacuationAdvisory', expectedEn: 'Evacuation Advisory' },
  { path: 'disasterInfo.evacuationVulnerable', expectedEn: 'Evacuation of Vulnerable People' },
  { path: 'disasterInfo.evacuationCenter', expectedEn: 'Evacuation Center / Shelter' },
  { path: 'disasterInfo.estimatedDamage', expectedEn: 'Estimated Damage / Projected Impact' },
  { path: 'disasterInfo.damageRatio', expectedEn: 'Damage Ratio (%)' },
  { path: 'disasterInfo.collapseRate', expectedEn: 'Building Collapse Rate' },
  { path: 'disasterInfo.isolatedAreas', expectedEn: 'Potentially Isolated Areas' },
];

glossaryChecks.forEach(check => {
  const parts = check.path.split('.');
  const jaVal = parts.reduce((o, k) => o && o[k], ja);
  const enVal = parts.reduce((o, k) => o && o[k], en);

  if (jaVal && enVal === check.expectedEn) {
    console.log(`  - ${check.path}: JA="${jaVal}" | EN="${enVal}"`);
  } else {
    console.error(`  ❌ Mismatch for ${check.path}: Expected EN "${check.expectedEn}", got "${enVal}"`);
    passed = false;
  }
});
console.log('  ✅ SUCCESS: All mandatory DRR & GIS glossary terms are correctly defined.\n');

// 3. 辞書取得ユーティリティ (getDictionarySync) の動作検証
console.log('[Test 3] Testing getDictionary Loader Utility...');
const jaDictResolved = getDictionarySync('ja');
const enDictResolved = getDictionarySync('en');
const fallbackDictResolved = getDictionarySync('invalid_locale');

assert.strictEqual(jaDictResolved.common.title, 'Disaster Density Engine');
assert.strictEqual(enDictResolved.common.title, 'Disaster Density Engine');
assert.strictEqual(fallbackDictResolved.common.title, 'Disaster Density Engine');
assert.strictEqual(enDictResolved.visualizer.modeRelative, '🔥 Impact Density (%) Mode');

console.log(`  - Resolved JA Title: "${jaDictResolved.common.title}"`);
console.log(`  - Resolved EN Title: "${enDictResolved.common.title}"`);
console.log('  ✅ SUCCESS: getDictionary utility safely resolves locales.\n');

if (passed) {
  console.log('====================================================');
  console.log('🎉 ALL i18n SYSTEM & GLOSSARY TESTS PASSED!');
  console.log('====================================================');
} else {
  console.error('❌ i18n System Tests Failed!');
  process.exit(1);
}
