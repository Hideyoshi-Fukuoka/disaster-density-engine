/**
 * Government Data Search Logic Verification Test
 */
const govFetcher = require("../backend/gov_fetcher");

async function runTests() {
  console.log("=== Government Search Verification Test ===");

  const testQueries = [
    "令和8年熊本地震に関する情報",
    "令和8年熊本地震 第13報",
    "第13報",
    "熊本地震第13報",
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
        console.log(`   [${idx + 1}] ID: ${r.id} | Title: ${r.title}`);
      });
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
