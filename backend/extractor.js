/**
 * Text Entity Extractor (LLM / Advanced Parser)
 * 報道・行政発表テキスト（非構造化データ）から
 * { 自治体名, 被害種別, 被害数値(絶対数), タイムスタンプ } を精度高く抽出する
 */

class TextEntityExtractor {
  constructor() {
    this.damageDefinitions = [
      {
        type: "collapsed_houses",
        label: "全壊・住家被害",
        regex: /(?:全壊|倒壊|全半壊|全焼|住家被害|家屋倒壊|倒壊家屋)[約およそ]*\s*([\d,]+)\s*(?:棟|戸|軒|件)?/g
      },
      {
        type: "water_outage",
        label: "断水",
        regex: /(?:断水|給水停止)[約およそ]*\s*([\d,]+)\s*(?:戸|世帯|件)?/g
      },
      {
        type: "power_outage",
        label: "停電",
        regex: /停電[約およそ]*\s*([\d,]+)\s*(?:戸|世帯|件)?/g
      },
      {
        type: "evacuees",
        label: "避難者数",
        regex: /(?:避難者|避難)[約およそ]*\s*([\d,]+)\s*(?:人|名)?/g
      }
    ];

    // 自治体名マッチング用正規表現
    this.cityPattern = /([一-龠ぁ-んァ-ヶ]{2,8}?(?:市|町|村|区))/g;
  }

  /**
   * テキストの事前正規化（桁区切りカンマの統一・除去）
   * @param {string} raw 
   * @returns {string}
   */
  normalizeText(raw) {
    if (!raw) return "";
    // 数字の間のカンマを除去 (例: 4,500 -> 4500)
    return raw.replace(/(?<=\d),(?=\d)/g, "");
  }

  /**
   * 非構造化テキストから被害データエントリ抽出
   * @param {string} text 
   * @returns {Array<Object>}
   */
  extract(text) {
    if (!text || typeof text !== "string") return [];

    const normalized = this.normalizeText(text);
    const results = [];
    const timestamp = new Date().toISOString();

    // 句点・改行・読点でセグメント化
    const segments = normalized.split(/(?<=[。\n、])/);

    let activeCity = null;

    for (const segment of segments) {
      const trimmed = segment.trim();
      if (!trimmed) continue;

      // セグメントから自治体名を検索
      const cityMatches = Array.from(trimmed.matchAll(this.cityPattern));
      if (cityMatches.length > 0) {
        // 新しい自治体名が検出された場合は更新
        activeCity = cityMatches[0][1];
      }

      if (!activeCity) continue;

      // 被害パターンの抽出
      for (const def of this.damageDefinitions) {
        const regex = new RegExp(def.regex.source, def.regex.flags);
        let match;
        while ((match = regex.exec(trimmed)) !== null) {
          const rawNum = match[1].replace(/,/g, "");
          const count = parseInt(rawNum, 10);
          if (!isNaN(count)) {
            // 重複チェック
            const isDuplicate = results.some(
              r => r.city_name === activeCity && r.damage_type === def.type && r.absolute_count === count
            );

            if (!isDuplicate) {
              results.push({
                city_name: activeCity,
                damage_type: def.type,
                damage_label: def.label,
                absolute_count: count,
                timestamp: timestamp,
                raw_sentence: trimmed
              });
            }
          }
        }
      }
    }

    return results;
  }
}

module.exports = new TextEntityExtractor();
