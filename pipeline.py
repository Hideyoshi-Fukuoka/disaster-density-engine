"""
Disaster Density Engine Core Pipeline (pipeline.py)

報道・行政発表テキストから被害数および自治体名を抽出し、
master_db.py を用いてJISコード・世帯数（全体数）と名寄せ結合した上で、
被害密度(%)および重症度ランク付きの Output JSON を生成するコアパイプライン。
"""

import json
import re
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

from master_db import resolve_municipality


class TextDamageExtractor:
    """非構造化テキストからのエンティティ抽出クラス"""

    def __init__(self):
        self.damage_patterns = [
            {
                "type": "collapsed_houses",
                "label": "全壊・住家被害",
                "regex": r"(?:全壊|倒壊|全半壊|全焼|住家被害|家屋倒壊|倒壊家屋)[約およそ]*\s*([\d,]+)\s*(?:棟|戸|軒|件)?"
            },
            {
                "type": "water_outage",
                "label": "断水",
                "regex": r"(?:断水|給水停止)[約およそ]*\s*([\d,]+)\s*(?:戸|世帯|件)?"
            },
            {
                "type": "power_outage",
                "label": "停電",
                "regex": r"停電[約およそ]*\s*([\d,]+)\s*(?:戸|世帯|件)?"
            },
            {
                "type": "evacuees",
                "label": "避難者数",
                "regex": r"(?:避難者|避難)[約およそ]*\s*([\d,]+)\s*(?:人|名)?"
            }
        ]
        self.city_pattern = re.compile(r"([一-龠ぁ-んァ-ヶ]{2,8}?(?:市|町|村|区))")

    def extract(self, text: str) -> List[Dict[str, Any]]:
        if not text:
            return []

        # 数字の間のカンマ桁区切りを除去 (例: 4,500 -> 4500)
        normalized_text = re.sub(r"(?<=\d),(?=\d)", "", text)
        segments = re.split(r"(?<=[。\n、])", normalized_text)

        results = []
        active_city = None

        for segment in segments:
            segment = segment.strip()
            if not segment:
                continue

            # 自治体名の検出
            city_matches = self.city_pattern.findall(segment)
            if city_matches:
                active_city = city_matches[0]

            if not active_city:
                continue

            # 被害パターンの抽出
            for ptn in self.damage_patterns:
                matches = re.finditer(ptn["regex"], segment)
                for m in matches:
                    raw_num = m.group(1).replace(",", "")
                    try:
                        count = int(raw_num)
                        # 重複追加の防止
                        if not any(r["city_name"] == active_city and r["damage_type"] == ptn["type"] and r["absolute_count"] == count for r in results):
                            results.append({
                                "city_name": active_city,
                                "damage_type": ptn["type"],
                                "absolute_count": count
                            })
                    except ValueError:
                        continue

        return results


class DisasterDensityPipeline:
    """抽出・結合・密度計算および JSON スキーマ整形を行う主パイプライン"""

    def __init__(self):
        self.extractor = TextDamageExtractor()

    def _select_total_base(self, damage_type: str, master_record: Dict[str, Any]) -> int:
        """被害種別に応じて分母（世帯数、住家数、総人口）を選択"""
        if damage_type == "evacuees":
            return master_record.get("total_population") or master_record.get("total_households") or 10000
        else:
            return master_record.get("total_households") or master_record.get("total_buildings") or 10000

    def _calculate_severity_rank(self, relative_rate_percent: float) -> str:
        """被害率に応じた重症度ランク判定"""
        if relative_rate_percent >= 10.0:
            return "CRITICAL"
        elif relative_rate_percent >= 5.0:
            return "SEVERE"
        elif relative_rate_percent >= 1.0:
            return "MODERATE"
        else:
            return "LOW"

    def process(self, text: str, disaster_name: str = "熊本地震（想定データ）") -> Dict[str, Any]:
        """
        テキストを入力とし、名寄せ結合・相対被害率計算を行い要求フォーマットの JSON スキーマを出力する
        """
        extracted_entities = self.extractor.extract(text)
        formatted_data = []

        for entity in extracted_entities:
            raw_city = entity["city_name"]
            master_record = resolve_municipality(raw_city)

            if master_record:
                jis_code = master_record["jis_code"]
                prefecture = master_record["prefecture"]
                city_name = master_record["city_name"]
                total_base = self._select_total_base(entity["damage_type"], master_record)
            else:
                jis_code = "99999"
                prefecture = "不明"
                city_name = raw_city
                total_base = 10000

            abs_count = entity["absolute_count"]
            rate_percent = round((abs_count / total_base) * 100, 2) if total_base > 0 else 0.0
            severity_rank = self._calculate_severity_rank(rate_percent)

            formatted_data.append({
                "jis_code": jis_code,
                "prefecture": prefecture,
                "city_name": city_name,
                "metrics": {
                    "damage_type": entity["damage_type"],
                    "absolute_count": abs_count,
                    "total_base": total_base,
                    "relative_rate_percent": rate_percent,
                    "severity_rank": severity_rank
                }
            })

        output_json = {
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "disaster_name": disaster_name,
            "data": formatted_data
        }

        return output_json


# パイプライン単体テスト
if __name__ == "__main__":
    pipeline = DisasterDensityPipeline()
    sample_text = "熊本県内の被害状況。熊本市で全壊約4,500棟、断水32,000戸。益城町で全壊約3,000棟、断水12,000戸。西原村で全壊513棟。"

    print("=== Disaster Density Pipeline (pipeline.py) 単体テスト ===")
    result_json = pipeline.process(sample_text, disaster_name="熊本地震（想定データ）")

    print(json.dumps(result_json, ensure_ascii=False, indent=2))
