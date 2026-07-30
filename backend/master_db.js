const fs = require("fs");
const path = require("path");

// 全国地方公共団体マスターデータ（シードファイル読み込みまたは組込みデータ）
let MUNICIPALITY_MASTER = [];

try {
  const jsonPath = path.join(__dirname, "../seeds/municipalities_master.json");
  if (fs.existsSync(jsonPath)) {
    MUNICIPALITY_MASTER = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  }
} catch (e) {
  console.error("Failed to load seeds/municipalities_master.json, falling back:", e);
}

if (MUNICIPALITY_MASTER.length === 0) {
  MUNICIPALITY_MASTER = [
    { year: 2016, jis_code: "43201", prefecture: "熊本県", city_name: "熊本市", total_households: 320000, total_population: 738000, total_buildings: 340000, aliases: ["熊本市", "熊本"] },
    { year: 2016, jis_code: "43441", prefecture: "熊本県", city_name: "益城町", total_households: 13500, total_population: 34000, total_buildings: 14200, aliases: ["益城町", "益城"] },
    { year: 2016, jis_code: "43443", prefecture: "熊本県", city_name: "西原村", total_households: 2600, total_population: 6800, total_buildings: 2750, aliases: ["西原村", "西原"] },
    { year: 2026, jis_code: "43201", prefecture: "熊本県", city_name: "熊本市", total_households: 338000, total_population: 738000, total_buildings: 395000, aliases: ["熊本市", "熊本"] },
    { year: 2026, jis_code: "43441", prefecture: "熊本県", city_name: "益城町", total_households: 15800, total_population: 34800, total_buildings: 16500, aliases: ["益城町", "益城"] },
    { year: 2026, jis_code: "43443", prefecture: "熊本県", city_name: "西原村", total_households: 3100, total_population: 6900, total_buildings: 3300, aliases: ["西原村", "西原"] }
  ];
}

class MasterDB {
  constructor() {
    this.records = MUNICIPALITY_MASTER;
  }

  /**
   * JISコードで自治体を検索
   * @param {string} jisCode 
   * @param {number} targetYear 
   * @returns {Object|null}
   */
  findByJisCode(jisCode, targetYear = 2026) {
    const matches = this.records.filter(item => item.jis_code === jisCode && (item.year || 2026) <= targetYear);
    if (matches.length === 0) return this.records.find(item => item.jis_code === jisCode) || null;
    matches.sort((a, b) => (b.year || 2026) - (a.year || 2026));
    return matches[0];
  }

  /**
   * 自治体名（またはエイリアス）と災害発生年で最も近い過去の統計マスターを検索
   * @param {string} rawName 
   * @param {number} targetYear 災害発生年（例: 2016, 2024, 2026）
   * @returns {Object|null}
   */
  findByName(rawName, targetYear = 2026) {
    if (!rawName) return null;
    const cleanName = rawName.trim().replace(/^(熊本県|石川県|東京都|福岡県|大分県|宮城県)/, "");

    // 対象自治体にマッチする全候補を取得
    const candidates = this.records.filter(item => {
      const matchCity = item.city_name === rawName || item.city_name === cleanName;
      const matchAlias = item.aliases && item.aliases.some(alias => alias === rawName || alias === cleanName);
      const matchPartial = cleanName.includes(item.city_name) || item.city_name.includes(cleanName);
      return matchCity || matchAlias || matchPartial;
    });

    if (candidates.length === 0) return null;

    // targetYear 以前で最大の year を持っているレコードを選択（時系列 Point-in-Time マッチング）
    const validByYear = candidates.filter(item => (item.year || 2026) <= targetYear);
    if (validByYear.length > 0) {
      validByYear.sort((a, b) => (b.year || 2026) - (a.year || 2026));
      return validByYear[0];
    }

    // 該当する年以下のレコードがない場合は、最も古いレコードを選択
    candidates.sort((a, b) => (a.year || 2026) - (b.year || 2026));
    return candidates[0];
  }

  /**
   * 全自治体データ取得
   */
  getAll() {
    return this.records;
  }
}

module.exports = new MasterDB();
