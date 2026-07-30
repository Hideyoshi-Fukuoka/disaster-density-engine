/**
 * Engine Pipeline Verification Test
 */
const extractor = require("../backend/extractor");
const resolver = require("../backend/resolver");
const mathEngine = require("../backend/math_engine");
const masterDB = require("../backend/master_db");

console.log("=== Disaster-Density-Engine Verification Test ===");

const sampleText = "熊本県内の被害状況。熊本市で全壊約4,500棟、断水32,000戸。益城町で全壊約3,000棟、断水12,000戸。西原村で全壊513棟。";

console.log("\n1. Input Unstructured Text:");
console.log(sampleText);

// Step 1: Extract
const extracted = extractor.extract(sampleText);
console.log(`\n2. Extracted Entities (${extracted.length} items):`);
console.log(JSON.stringify(extracted, null, 2));

// Step 2: Resolve
const resolved = resolver.resolveList(extracted);
console.log(`\n3. Resolved Entities:`);
console.log(JSON.stringify(resolved, null, 2));

// Step 3: Math Engine & Output Schema
const output = mathEngine.process(resolved, "熊本地震（想定データ）");
console.log("\n4. Final Dual-Mode JSON Output:");
console.log(JSON.stringify(output, null, 2));

// Validation checks
console.log("\n=== Automated Validation Checks ===");
const kumamotoHouses = output.data.find(d => d.city_name === "熊本市" && d.metrics.damage_type === "collapsed_houses");
const mashikiHouses = output.data.find(d => d.city_name === "益城町" && d.metrics.damage_type === "collapsed_houses");
const nishiharaHouses = output.data.find(d => d.city_name === "西原村" && d.metrics.damage_type === "collapsed_houses");

if (kumamotoHouses) {
  console.log(`✅ 熊本市 全壊率: ${kumamotoHouses.metrics.relative_rate_percent}% (Rank: ${kumamotoHouses.metrics.severity_rank}) [Expected ~1.41% / MODERATE]`);
} else {
  console.error("❌ 熊本市 のデータが見つかりません");
}

if (mashikiHouses) {
  console.log(`✅ 益城町 全壊率: ${mashikiHouses.metrics.relative_rate_percent}% (Rank: ${mashikiHouses.metrics.severity_rank}) [Expected ~22.22% / CRITICAL]`);
} else {
  console.error("❌ 益城町 のデータが見つかりません");
}

if (nishiharaHouses) {
  console.log(`✅ 西原村 全壊率: ${nishiharaHouses.metrics.relative_rate_percent}% (Rank: ${nishiharaHouses.metrics.severity_rank}) [Expected ~19.73% / CRITICAL]`);
} else {
  console.error("❌ 西原村 のデータが見つかりません");
}
