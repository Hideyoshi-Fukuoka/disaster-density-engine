/**
 * Static Master DB Module
 * 総務省「全国地方公共団体コード（JISコード）」に紐づく世帯数・総人口・住家総数の参照用マスターデータベース
 */

// 全国地方公共団体マスターデータ（シードデータ）
const MUNICIPALITY_MASTER = [
  // 熊本県
  {
    jis_code: "43201",
    prefecture: "熊本県",
    city_name: "熊本市",
    total_households: 338000,
    total_population: 738000,
    total_buildings: 395000,
    aliases: ["熊本市", "熊本市中央区", "熊本市東区", "熊本市西区", "熊本市南区", "熊本市北区", "熊本"]
  },
  {
    jis_code: "43441",
    prefecture: "熊本県",
    city_name: "益城町",
    total_households: 15800,
    total_population: 34800,
    total_buildings: 16500,
    aliases: ["益城町", "益城"]
  },
  {
    jis_code: "43443",
    prefecture: "熊本県",
    city_name: "西原村",
    total_households: 3100,
    total_population: 6900,
    total_buildings: 3300,
    aliases: ["西原村", "西原"]
  },
  {
    jis_code: "43442",
    prefecture: "熊本県",
    city_name: "南阿蘇村",
    total_households: 4500,
    total_population: 10500,
    total_buildings: 4900,
    aliases: ["南阿蘇村", "南阿蘇"]
  },
  {
    jis_code: "43401",
    prefecture: "熊本県",
    city_name: "菊陽町",
    total_households: 19800,
    total_population: 44200,
    total_buildings: 20500,
    aliases: ["菊陽町", "菊陽"]
  },
  {
    jis_code: "43211",
    prefecture: "熊本県",
    city_name: "宇土市",
    total_households: 15200,
    total_population: 36500,
    total_buildings: 16000,
    aliases: ["宇土市", "宇土"]
  },
  {
    jis_code: "43202",
    prefecture: "熊本県",
    city_name: "八代市",
    total_households: 53500,
    total_population: 123000,
    total_buildings: 56000,
    aliases: ["八代市", "八代"]
  },
  {
    jis_code: "43444",
    prefecture: "熊本県",
    city_name: "御船町",
    total_households: 7200,
    total_population: 16800,
    total_buildings: 7600,
    aliases: ["御船町", "御船"]
  },
  {
    jis_code: "43203",
    prefecture: "熊本県",
    city_name: "人吉市",
    total_households: 13000,
    total_population: 31500,
    total_buildings: 13800,
    aliases: ["人吉市", "人吉"]
  },
  {
    jis_code: "43444",
    prefecture: "熊本県",
    city_name: "御船町",
    total_households: 6700,
    total_population: 16800,
    total_buildings: 7100,
    aliases: ["御船町", "御船"]
  },
  {
    jis_code: "43445",
    prefecture: "熊本県",
    city_name: "嘉島町",
    total_households: 3800,
    total_population: 9600,
    total_buildings: 4000,
    aliases: ["嘉島町", "嘉島"]
  },
  {
    jis_code: "43446",
    prefecture: "熊本県",
    city_name: "甲佐町",
    total_households: 3900,
    total_population: 10100,
    total_buildings: 4100,
    aliases: ["甲佐町", "甲佐"]
  },
  {
    jis_code: "43214",
    prefecture: "熊本県",
    city_name: "阿蘇市",
    total_households: 10500,
    total_population: 26000,
    total_buildings: 11200,
    aliases: ["阿蘇市", "阿蘇"]
  },
  // 石川県 (能登半島地震例)
  {
    jis_code: "17204",
    prefecture: "石川県",
    city_name: "輪島市",
    total_households: 10200,
    total_population: 23500,
    total_buildings: 11000,
    aliases: ["輪島市", "輪島"]
  },
  {
    jis_code: "17205",
    prefecture: "石川県",
    city_name: "珠洲市",
    total_households: 5600,
    total_population: 12800,
    total_buildings: 6000,
    aliases: ["珠洲市", "珠洲"]
  },
  {
    jis_code: "17463",
    prefecture: "石川県",
    city_name: "能登町",
    total_households: 6500,
    total_population: 15000,
    total_buildings: 6900,
    aliases: ["能登町", "能登"]
  },
  {
    jis_code: "17407",
    prefecture: "石川県",
    city_name: "穴水町",
    total_households: 3400,
    total_population: 7800,
    total_buildings: 3600,
    aliases: ["穴水町", "穴水"]
  },
  // 東京都 / その他代表都市
  {
    jis_code: "13101",
    prefecture: "東京都",
    city_name: "千代田区",
    total_households: 36000,
    total_population: 67000,
    total_buildings: 25000,
    aliases: ["千代田区", "千代田"]
  },
  {
    jis_code: "13104",
    prefecture: "東京都",
    city_name: "新宿区",
    total_households: 220000,
    total_population: 340000,
    total_buildings: 150000,
    aliases: ["新宿区", "新宿"]
  }
];

class MasterDB {
  constructor() {
    this.records = MUNICIPALITY_MASTER;
  }

  /**
   * JISコードで自治体を検索
   * @param {string} jisCode 
   * @returns {Object|null}
   */
  findByJisCode(jisCode) {
    return this.records.find(item => item.jis_code === jisCode) || null;
  }

  /**
   * 自治体名（またはエイリアス）で完全一致/部分一致検索
   * @param {string} rawName 
   * @returns {Object|null}
   */
  findByName(rawName) {
    if (!rawName) return null;
    const cleanName = rawName.trim().replace(/^(熊本県|石川県|東京都|福岡県|大分県)/, "");

    // 1. 完全一致 (city_name)
    let match = this.records.find(item => item.city_name === rawName || item.city_name === cleanName);
    if (match) return match;

    // 2. エイリアス一致
    match = this.records.find(item => item.aliases.some(alias => alias === rawName || alias === cleanName));
    if (match) return match;

    // 3. 部分一致
    match = this.records.find(item => cleanName.includes(item.city_name) || item.city_name.includes(cleanName));
    return match || null;
  }

  /**
   * 全自治体データ取得
   */
  getAll() {
    return this.records;
  }
}

module.exports = new MasterDB();
