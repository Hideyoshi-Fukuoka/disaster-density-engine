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

// Time-Series Year Resolution Test
console.log("\n=== Time-Series Point-in-Time Resolution Test ===");
const text2016 = "平成28年熊本地震速報。益城町で全壊3000棟。";
const resolved2016 = resolver.resolveList(extractor.extract(text2016), 2016);
const output2016 = mathEngine.process(resolved2016, "平成28年熊本地震");

const text2026 = "令和8年熊本地震速報。益城町で全壊3000棟。";
const resolved2026 = resolver.resolveList(extractor.extract(text2026), 2026);
const output2026 = mathEngine.process(resolved2026, "令和8年熊本地震");

console.log(`2016年熊本地震: 益城町 分母=${output2016.data[0].metrics.total_base} (${output2016.data[0].metrics.total_base_year}年統計) -> 密度 ${output2016.data[0].metrics.relative_rate_percent}%`);
console.log(`2026年熊本地震: 益城町 分母=${output2026.data[0].metrics.total_base} (${output2026.data[0].metrics.total_base_year}年統計) -> 密度 ${output2026.data[0].metrics.relative_rate_percent}%`);

if (output2016.data[0].metrics.total_base_year === 2016 && output2026.data[0].metrics.total_base_year === 2026) {
  console.log("✅ 時系列 Point-in-Time マスター引き当て成功!");
} else {
  console.error("❌ 時系列 Point-in-Time マスター引き当て失敗");
}
