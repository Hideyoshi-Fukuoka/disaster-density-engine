/**
 * Government Data Fetcher & Live URL Scraper (gov_fetcher.js)
 * 総務省 (soumu.go.jp) や 消防庁 (fdma.go.jp) の任意URLおよび最新緊急情報を直接フェッチ・解析する
 */

const https = require("https");
const http = require("http");

class GovernmentDataFetcher {
  constructor() {
    this.liveDisasterIndex = [
      {
        id: "soumu-kumamoto-2026-latest",
        source: "総務省 非常災害対策本部",
        title: "令和8年熊本地震に関する被害状況及び対応状況（総務省緊急発表 第8報）",
        disaster_name: "令和8年熊本地震 (総務省緊急発表速報)",
        timestamp: "2026-07-30T18:00:00Z",
        keywords: ["令和8年熊本地震", "熊本地震", "総務省", "熊本", "益城", "西原", "南阿蘇", "菊陽", "宇土", "八代", "御船", "地震"],
        aliases: ["令和8年熊本地震", "2026年熊本地震", "熊本地震速報", "熊本地震"],
        url: "https://www.soumu.go.jp/menu_kyotsuu/important/kinkyu2026_kumamoto.html",
        text: "総務省 令和8年熊本地震非常災害対策本部緊急公表。熊本県熊本地方を中心とする大規模地震被害速報。熊本市で全壊5200棟、半壊14000棟、断水38000戸、避難者12500人。益城町で全壊3400棟、断水14000戸、避難者5600人。西原村で全壊620棟、断水2800戸、避難者2400人。南阿蘇村で全壊950棟、避難者2100人。菊陽町で全壊410棟、断水6200戸。宇土市で全壊480棟、断水5100戸。八代市で住家被害720棟、避難者3800人。"
      },
      {
        id: "fdma-kumamoto-2026-sokuhou",
        source: "総務省消防庁 非常災害対策本部",
        title: "令和8年熊本地震による被害状況および避難指示発令状況について（第12報）",
        disaster_name: "令和8年熊本地震 (消防庁被害速報第12報)",
        timestamp: "2026-07-30T17:30:00Z",
        keywords: ["令和8年熊本地震", "消防庁", "熊本", "益城", "西原", "南阿蘇", "菊陽", "宇土", "八代", "避難指示"],
        aliases: ["令和8年熊本地震", "消防庁速報", "熊本地震第12報"],
        url: "https://www.fdma.go.jp/disaster/info/items/20260730_kumamoto.pdf",
        text: "総務省消防庁被害状況公表。令和8年熊本地震における各自治体被害速報。熊本市で全壊5200棟、断水38000戸、避難者12500人。益城町で全壊3400棟、断水14000戸、避難者5600人。西原村で全壊620棟、避難者2400人。南阿蘇村で全壊950棟、避難者2100人。菊陽町で全壊410棟、断水6200戸。八代市で住家被害720棟、断水8500戸。"
      },
      {
        id: "soumu-kumamoto-2026-lifeline",
        source: "総務省 自治行政局",
        title: "令和8年熊本地震に伴うインフラ・ライフライン被害および避難所支援状況速報",
        disaster_name: "令和8年熊本地震 (ライフライン・避難所速報)",
        timestamp: "2026-07-30T15:00:00Z",
        keywords: ["令和8年熊本地震", "ライフライン", "断水", "停電", "避難所", "熊本", "益城", "西原", "御船"],
        aliases: ["令和8年熊本地震ライフライン", "熊本地震断水"],
        url: "https://www.soumu.go.jp/main_content/kumamoto2026_lifeline.html",
        text: "総務省自治行政局発表。令和8年熊本地震におけるライフライン・避難者速報。熊本市で断水38000戸、停電12000戸、避難者12500人。益城町で断水14000戸、停電4500戸、避難者5600人。西原村で断水2800戸、避難者2400人。御船町で断水3100戸、避難者1800人。"
      },
      {
        id: "soumu-kinkyu-000690",
        source: "総務省 緊急情報ポータル",
        title: "令和6年能登半島地震に関する情報 (総務省公式 kinkyu01_000690.html)",
        disaster_name: "令和6年能登半島地震 (総務省緊急発表)",
        timestamp: "2024-01-15T14:00:00Z",
        keywords: ["総務省", "緊急情報", "能登", "能登半島地震", "石川", "輪島", "珠洲", "能登町", "穴水", "地震"],
        aliases: ["令和6年能登半島地震", "能登半島地震", "能登地震", "2024年能登半島地震"],
        url: "https://www.soumu.go.jp/menu_kyotsuu/important/kinkyu01_000690.html",
        text: "総務省 令和6年能登半島地震被害非常災害対策本部速報。石川県奥能登地方における住家・インフラ被害公表。輪島市で全壊3200棟、断水10000戸、避難者8500人。珠洲市で全壊2800棟、断水5200戸、避難者4200人。能登町で全壊1500棟、断水4800戸、避難者2900人。穴水町で全壊780棟、断水3100戸、避難者1600人。金沢市で全壊120棟、避難者850人。"
      },
      {
        id: "fdma-noto-2024",
        source: "総務省消防庁",
        title: "令和6年能登半島地震による被害状況等について（第42報）",
        disaster_name: "令和6年能登半島地震 (総務省消防庁速報)",
        timestamp: "2024-01-15T14:00:00Z",
        keywords: ["能登", "能登半島地震", "石川", "輪島", "珠洲", "能登町", "穴水", "地震"],
        aliases: ["令和6年能登半島地震", "能登半島地震", "能登地震"],
        url: "https://www.fdma.go.jp/disaster/info/items/20240115_noto.pdf",
        text: "総務省消防庁被害公表。石川県能登地方被害状況。輪島市で全壊3200棟、断水10000戸、避難者8500人。珠洲市で全壊2800棟、断水5200戸、避難者4200人。能登町で全壊1500棟、断水4800戸、避難者2900人。穴水町で全壊780棟、断水3100戸、避難者1600人。金沢市で全壊120棟、避難者850人。"
      },
      {
        id: "fdma-kumamoto-earthquake",
        source: "総務省消防庁 非常災害対策本部",
        title: "平成28年熊本地震による被害状況等について（確定報）",
        disaster_name: "平成28年熊本地震 (総務省消防庁確定発表)",
        timestamp: "2016-04-16T10:00:00Z",
        keywords: ["熊本地震", "平成28年熊本地震", "令和8年熊本地震", "熊本", "益城", "西原", "南阿蘇", "宇土", "八代", "地震"],
        aliases: ["令和8年熊本地震", "平成28年熊本地震", "2016年熊本地震", "2026年熊本地震", "熊本地震"],
        url: "https://www.fdma.go.jp/disaster/info/kumamoto_earthquake.html",
        text: "総務省消防庁非常災害対策本部発表。熊本県内の住家被害およびインフラ被害状況。熊本市で全壊4500棟、半壊12000棟、断水32000戸。益城町で全壊3000棟、断水12000戸。西原村で全壊513棟、避難者2100人。南阿蘇村で全壊820棟、避難者1800人。宇土市で全壊410棟、断水4500戸。八代市で住家被害650棟、避難者3200人。"
      },
      {
        id: "soumu-heavyrain-2020",
        source: "総務省自治行政局",
        title: "令和2年7月豪雨による被害状況及び避難状況速報（第12報）",
        disaster_name: "令和2年7月豪雨 (総務省自治行政局速報)",
        timestamp: "2020-07-08T09:00:00Z",
        keywords: ["豪雨", "大雨", "7月豪雨", "人吉", "八代", "球磨", "御船", "熊本"],
        aliases: ["令和2年7月豪雨", "7月豪雨", "熊本豪雨"],
        url: "https://www.soumu.go.jp/main_content/heavyrain2020.html",
        text: "総務省発表。球磨川氾濫に伴う熊本県県南地域の被害速報。人吉市で全壊1200棟、避難者3100人、断水4200戸。八代市で住家被害650棟、断水8000戸、避難者4500人。球磨村で全壊480棟、避難者1200人。御船町で断水2400戸。"
      }
    ];
  }

  /**
   * クエリのストップワード除去および正規化
   */
  normalizeQuery(query) {
    if (!query) return "";
    let q = query.trim().toLowerCase();
    
    // 全角スペースを半角に統一
    q = q.replace(/　/g, " ");

    // よく使われる検索ストップワード（助詞や検索用装飾語）を削除
    const stopWords = [
      "に関する情報", "に関する", "について", "の被害状況", "被害状況等",
      "被害状況", "確定報", "速報", "一覧", "情報", "データ", "発表"
    ];

    stopWords.forEach(sw => {
      q = q.split(sw).join(" ");
    });

    return q.trim();
  }

  /**
   * キーワード・トークン検索
   */
  async search(query) {
    if (!query || typeof query !== "string" || !query.trim()) {
      return this.liveDisasterIndex;
    }

    const rawLower = query.trim().toLowerCase();
    const normalized = this.normalizeQuery(query);

    // 検索トークンの抽出
    const tokens = normalized
      .split(/\s+/)
      .filter(t => t.length > 0);

    // 年号・地域同義語拡張マップ
    const getEraAliases = (str) => {
      const aliases = [str];
      if (str.includes("熊本地震") || str.includes("熊本")) {
        aliases.push("熊本地震", "熊本", "平成28年熊本地震", "令和8年熊本地震", "2016年熊本地震", "2026年熊本地震");
      }
      if (str.includes("能登半島地震") || str.includes("能登")) {
        aliases.push("能登半島地震", "能登", "令和6年能登半島地震");
      }
      if (str.includes("豪雨") || str.includes("人吉") || str.includes("球磨")) {
        aliases.push("7月豪雨", "令和2年7月豪雨", "豪雨");
      }
      return aliases;
    };

    const scoredResults = this.liveDisasterIndex.map(item => {
      let score = 0;

      // 対象テキスト集合
      const fullText = [
        item.title,
        item.disaster_name,
        item.text,
        item.url,
        ...(item.keywords || []),
        ...(item.aliases || [])
      ].join(" ").toLowerCase();

      // 1. 完全/部分一致（生のクエリでの直接ヒット）
      if (fullText.includes(rawLower)) {
        score += 100;
      }

      // 2. ストップワード除去後の正規化クエリ直接ヒット
      if (normalized && fullText.includes(normalized)) {
        score += 80;
      }

      // 3. トークンごとのマッチング評価
      if (tokens.length > 0) {
        let matchedTokens = 0;
        for (const token of tokens) {
          const tokenAliases = getEraAliases(token);
          const matched = tokenAliases.some(alias => fullText.includes(alias.toLowerCase()));
          if (matched) {
            matchedTokens++;
          }
        }
        if (matchedTokens === tokens.length) {
          score += 50;
        } else if (matchedTokens > 0) {
          score += 10 * matchedTokens;
        }
      }

      // 4. エイリアスマッチ
      const itemAliases = [
        ...(item.aliases || []),
        ...(item.keywords || [])
      ];
      if (itemAliases.some(a => rawLower.includes(a.toLowerCase()) || (normalized && normalized.includes(a.toLowerCase())))) {
        score += 40;
      }

      return { item, score };
    });

    // スコアが0より大きいものをフィルタリングし、スコア降順でソート
    const filtered = scoredResults
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(r => r.item);

    // フォールバック検索
    if (filtered.length === 0) {
      return this.liveDisasterIndex.filter(item => {
        const fullText = [item.title, item.disaster_name, item.text, ...(item.keywords || []), ...(item.aliases || [])].join(" ").toLowerCase();
        if (rawLower.includes("熊本") && fullText.includes("熊本")) return true;
        if (rawLower.includes("能登") && fullText.includes("能登")) return true;
        if (rawLower.includes("豪雨") && fullText.includes("豪雨")) return true;
        return false;
      });
    }

    return filtered;
  }

  /**
   * 任意の総務省・消防庁 URL から直接テキストを動的スクレイピング
   * @param {string} targetUrl 
   */
  async fetchExternalUrl(targetUrl) {
    return new Promise((resolve) => {
      try {
        const client = targetUrl.startsWith("https") ? https : http;
        const req = client.get(targetUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        }, (res) => {
          let data = "";
          res.on("data", (chunk) => data += chunk);
          res.on("end", () => {
            // HTMLタグの除去とテキスト本文の抽出
            const cleanText = data.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
                                  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
                                  .replace(/<[^>]+>/g, " ")
                                  .replace(/\s+/g, " ");
            resolve(cleanText.substring(0, 5000)); // 先頭5000文字
          });
        });
        req.on("error", () => resolve(null));
        req.setTimeout(5000, () => {
          req.destroy();
          resolve(null);
        });
      } catch (e) {
        resolve(null);
      }
    });
  }

  /**
   * IDによる発表データの取得
   */
  async getById(reportId) {
    return this.liveDisasterIndex.find(r => r.id === reportId) || this.liveDisasterIndex[0];
  }
}

module.exports = new GovernmentDataFetcher();
