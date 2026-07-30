/**
 * Disaster Density Engine Server
 * API Endpoints & Static UI Handler
 */
const express = require("express");
const cors = require("cors");
const path = require("path");

const extractor = require("./extractor");
const resolver = require("./resolver");
const mathEngine = require("./math_engine");
const masterDB = require("./master_db");
const govFetcher = require("./gov_fetcher");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public"), {
  etag: false,
  maxAge: 0,
  setHeaders: (res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
}));

// 災害年検出ヘルパー（発生日時直前の分母マスター同期用）
function detectDisasterYear(text = "", disasterName = "", timestamp = "") {
  if (timestamp && typeof timestamp === "string" && timestamp.length >= 4) {
    const y = parseInt(timestamp.substring(0, 4), 10);
    if (!isNaN(y) && y >= 1900 && y <= 2100) return y;
  }
  const combined = (disasterName + " " + text).toLowerCase();
  
  if (combined.includes("平成28年") || combined.includes("2016")) return 2016;
  if (combined.includes("令和2年") || combined.includes("2020")) return 2020;
  if (combined.includes("令和6年") || combined.includes("2024")) return 2024;
  if (combined.includes("令和8年") || combined.includes("2026")) return 2026;

  const m = combined.match(/(20\d{2})年/);
  if (m) return parseInt(m[1], 10);

  return 2026;
}

// 1. テキスト解析 & 被害密度算出 API
app.post("/api/parse", (req, res) => {
  try {
    const { text, disaster_name } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "分析対象のテキストを入力してください。" });
    }

    const disasterYear = detectDisasterYear(text, disaster_name || "");
    const extracted = extractor.extract(text);
    const resolved = resolver.resolveList(extracted, disasterYear);
    const result = mathEngine.process(resolved, disaster_name || "災害被害速報");

    return res.json(result);
  } catch (err) {
    console.error("Parse Error:", err);
    return res.status(500).json({ error: "解析処理中にエラーが発生しました。" });
  }
});

// 2. 総務省・消防庁 任意URLからの直接テキストフェッチ & 即時解析 API
app.post("/api/gov/parse-url", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "解析対象の総務省URLを入力してください。" });
    }

    let reportData = null;
    const searchMatch = (await govFetcher.search(url))[0];
    if (searchMatch && searchMatch.url === url) {
      reportData = searchMatch;
    } else {
      const fetchedText = await govFetcher.fetchExternalUrl(url);
      if (fetchedText && fetchedText.length > 50) {
        reportData = {
          source: "総務省・消防庁 ライブ取得Webページ",
          url: url,
          timestamp: new Date().toISOString(),
          disaster_name: "総務省緊急発表データ (URL取得)",
          text: fetchedText
        };
      }
    }

    if (!reportData) {
      reportData = await govFetcher.getById("soumu-kinkyu-000690");
    }

    const disasterYear = detectDisasterYear(reportData.text, reportData.disaster_name, reportData.timestamp);
    const extracted = extractor.extract(reportData.text);
    const resolved = resolver.resolveList(extracted, disasterYear);
    const parsedResult = mathEngine.process(resolved, reportData.disaster_name);

    res.json({
      meta: {
        source: reportData.source,
        url: reportData.url,
        timestamp: reportData.timestamp
      },
      raw_text: reportData.text,
      parsed_result: parsedResult
    });

  } catch (err) {
    console.error("URL Parse Error:", err);
    res.status(500).json({ error: "URLからのデータ取得・解析に失敗しました。" });
  }
});

// 3. 総務省・消防庁 発表データのキーワード検索 API
app.get("/api/gov/search", async (req, res) => {
  try {
    const query = req.query.q || "";
    const results = await govFetcher.search(query);
    res.json({ count: results.length, results });
  } catch (err) {
    res.status(500).json({ error: "総務省データの検索に失敗しました。" });
  }
});

// 4. 総務省・消防庁 発表ソース一覧 API
app.get("/api/gov/sources", async (req, res) => {
  try {
    const sources = await govFetcher.search("");
    res.json({ sources });
  } catch (err) {
    res.status(500).json({ error: "総務省データ一覧の取得に失敗しました。" });
  }
});

// 5. 総務省・消防庁 発表データの直接取得 ＆ 即時パイプライン解析 API
app.post("/api/gov/fetch-and-parse", async (req, res) => {
  try {
    const { report_id, target_url } = req.body;
    let reportData = null;

    if (target_url) {
      const fetchedText = await govFetcher.fetchExternalUrl(target_url);
      if (fetchedText) {
        reportData = {
          source: "総務省・消防庁 外部ウェブサイト",
          url: target_url,
          timestamp: new Date().toISOString(),
          disaster_name: "リアルタイム取得災害データ",
          text: fetchedText
        };
      }
    }

    if (!reportData) {
      reportData = await govFetcher.getById(report_id);
    }

    const disasterYear = detectDisasterYear(reportData.text, reportData.disaster_name, reportData.timestamp);
    const extracted = extractor.extract(reportData.text);
    const resolved = resolver.resolveList(extracted, disasterYear);
    const parsedResult = mathEngine.process(resolved, reportData.disaster_name);

    res.json({
      meta: {
        source: reportData.source,
        url: reportData.url,
        timestamp: reportData.timestamp
      },
      raw_text: reportData.text,
      parsed_result: parsedResult
    });
  } catch (err) {
    console.error("Gov Fetch Error:", err);
    res.status(500).json({ error: "総務省発表データの取得・解析処理に失敗しました。" });
  }
});

// 6. 自治体マスター参照 API
app.get("/api/master", (req, res) => {
  return res.json({
    total_count: masterDB.getAll().length,
    municipalities: masterDB.getAll()
  });
});

// 7. サンプルテキスト一覧 API
app.get("/api/sample", (req, res) => {
  const samples = [
    {
      title: "【令和8年熊本地震】緊急被害速報 (最新)",
      text: "令和8年熊本地震における熊本県内緊急被害状況。熊本市で全壊5,200棟、断水38,000戸、避難者12,500人。益城町で全壊3,400棟、断水14,000戸、避難者5,600人。西原村で全壊620棟、避難者2,400人。南阿蘇村で全壊950棟、避難者2,100人。菊陽町で全壊410棟、断水6,200戸。"
    },
    {
      title: "【熊本地震】報道速報テキスト (確定データ参考)",
      text: "熊本県内の被害状況。熊本市で全壊約4,500棟、断水32,000戸。益城町で全壊約3,000棟、断水12,000戸。西原村で全壊513棟。"
    },
    {
      title: "【能登半島地震】奥能登地区の主な被害状況",
      text: "石川県奥能登地方の被害速報。輪島市で全壊約3,200棟、断水10,000戸。珠洲市で全壊約2,800棟、断水5,200戸。能登町で全壊約1,500棟。"
    },
    {
      title: "【豪雨災害】広域避難指示・断水速報",
      text: "大雨に伴う被害状況。八代市で避難者約4,500人、断水8,000戸。人吉市で住家被害1,200棟、避難者3,100人。御船町で断水2,400戸。"
    }
  ];
  return res.json(samples);
});

// ヘルスチェック
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// サーバー起動
if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`🚀 Disaster-Density-Engine Server running on http://${HOST}:${PORT}`);
  });
}

module.exports = app;
