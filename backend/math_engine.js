/**
 * Math Engine & Dual-Mode Visualization Schema Generator
 * 相対数（被害密度%）の算出、重症度ランクの付与、および要求JSON Schemaへの変換を行う
 */

class MathEngine {
  /**
   * 被害割合(%)の計算
   * @param {number} absoluteCount 被害絶対数
   * @param {number} totalBase 全体数（世帯数、住家数、総人口）
   * @returns {number} 小数点第二位までの%数値
   */
  calculateRelativeRate(absoluteCount, totalBase) {
    if (!totalBase || totalBase <= 0) return 0;
    const rate = (absoluteCount / totalBase) * 100;
    return Math.round(rate * 100) / 100;
  }

  /**
   * 被害率に応じた重症度ランクの判定
   * @param {number} relativeRatePercent 
   * @returns {string} CRITICAL | SEVERE | MODERATE | LOW
   */
  determineSeverityRank(relativeRatePercent) {
    if (relativeRatePercent >= 10.0) return "CRITICAL";
    if (relativeRatePercent >= 5.0) return "SEVERE";
    if (relativeRatePercent >= 1.0) return "MODERATE";
    return "LOW";
  }

  /**
   * 被害種別に応じた分母（全体数）の選定
   * @param {Object} resolvedItem 
   * @returns {number}
   */
  selectTotalBase(resolvedItem) {
    switch (resolvedItem.damage_type) {
      case "evacuees":
        return resolvedItem.total_population || resolvedItem.total_households || 10000;
      case "collapsed_houses":
      case "water_outage":
      case "power_outage":
      default:
        return resolvedItem.total_households || resolvedItem.total_buildings || 10000;
    }
  }

  /**
   * 名寄せ済みデータから要求されている Output JSON Schema を生成
   * @param {Array<Object>} resolvedList 
   * @param {string} disasterName 
   * @returns {Object}
   */
  process(resolvedList, disasterName = "災害発生速報データ") {
    const formattedData = resolvedList.map(item => {
      const totalBase = this.selectTotalBase(item);
      const relativeRatePercent = this.calculateRelativeRate(item.absolute_count, totalBase);
      const severityRank = this.determineSeverityRank(relativeRatePercent);

      return {
        jis_code: item.jis_code,
        prefecture: item.prefecture,
        city_name: item.city_name,
        metrics: {
          damage_type: item.damage_type,
          absolute_count: item.absolute_count,
          total_base: totalBase,
          relative_rate_percent: relativeRatePercent,
          severity_rank: severityRank
        }
      };
    });

    return {
      timestamp: new Date().toISOString(),
      disaster_name: disasterName,
      data: formattedData
    };
  }
}

module.exports = new MathEngine();
