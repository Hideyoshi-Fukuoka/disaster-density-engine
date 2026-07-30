/**
 * Entity Resolution Engine
 * 抽出された自治体名をJISコードに名寄せ（正規化/検索）し、マスターデータと結合する
 */
const masterDB = require("./master_db");

class EntityResolver {
  /**
   * 抽出されたエンティティリストをJISコードとマスターデータへ名寄せ結合する
   * @param {Array<Object>} extractedEntities 
   * @returns {Array<Object>}
   */
  resolveList(extractedEntities) {
    if (!Array.isArray(extractedEntities)) return [];

    return extractedEntities.map(entity => {
      const masterRecord = masterDB.findByName(entity.city_name);

      if (masterRecord) {
        return {
          ...entity,
          jis_code: masterRecord.jis_code,
          prefecture: masterRecord.prefecture,
          city_name: masterRecord.city_name, // 正規化された正式自治体名
          total_households: masterRecord.total_households,
          total_population: masterRecord.total_population,
          total_buildings: masterRecord.total_buildings,
          is_resolved: true
        };
      } else {
        // 未知の自治体の場合のデフォルトフォールバック
        return {
          ...entity,
          jis_code: "99999",
          prefecture: "不明",
          city_name: entity.city_name,
          total_households: 10000, // 推定値
          total_population: 25000,
          total_buildings: 10000,
          is_resolved: false
        };
      }
    });
  }
}

module.exports = new EntityResolver();
