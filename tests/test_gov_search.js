/**
 * Government Data Search Logic Verification Test
 */
const govFetcher = require("../backend/gov_fetcher");

async function runTests() {
  console.log("=== Government Search Verification Test ===");

  const testQueries = [
    "令和8年熊本地震に関する情報",
    "令和8年熊本地震 第14報",
    "第14報",
    "熊本地震第14報",
    "令和8年熊本地震 第13報",
    "第15報 (動的適応テスト)",
    "令和8年熊本地震 第16報",
    "令和8年熊本地震",
    "熊本地震",
    "平成28年熊本地震",
    "令和6年能登半島地震に関する情報",
    "能登半島地震",
    "豪雨"
  ];

  let passed = true;

  for (const query of testQueries) {
    const results = await govFetcher.search(query);
    console.log(`\n🔍 Query: "${query}" -> Found: ${results.length} item(s)`);
    if (results.length > 0) {
      results.forEach((r, idx) => {
        console.log(`   [${idx + 1}] ID: ${r.id} | Title: ${r.title} | is_latest: ${r.is_latest}`);
      });

      // 検証1: 一般クエリ（「令和8年熊本地震」「熊本地震」）では最大報数 (N=14) が自動的に1位かつis_latest=true
      if ((query === "令和8年熊本地震" || query === "熊本地震") && (results[0].id !== "fdma-kumamoto-2026-dai14hou" || !results[0].is_latest)) {
        console.error(`❌ FAILED: Query "${query}" did not dynamically resolve max report N=14 as top/latest.`);
        passed = false;
      }

      // 検証2: 未登録の報数（第15報、第16報）クエリで動的に最新化解決されること
      if (query.includes("第15報") && (!results[0].title.includes("第15報") || !results[0].is_latest)) {
        console.error(`❌ FAILED: Query "${query}" failed dynamic N=15 latest resolution.`);
        passed = false;
      }
    } else {
      console.error(`❌ FAILED: Query "${query}" returned 0 results.`);
      passed = false;
    }
  }

  console.log("\n=== Test Results Summary ===");
  if (passed) {
    console.log("✅ ALL SEARCH TESTS PASSED SUCCESSFULLY!");
  } else {
    console.error("❌ SOME SEARCH TESTS FAILED!");
    process.exit(1);
  }
}

runTests();
