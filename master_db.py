"""
Master Data & Entity Resolution Module (master_db.py)

全国地方公共団体コード（JISコード）および国勢調査世帯数データの管理、
自治体名の表記揺れ（例: 「益城町」「熊本県益城町」「熊本県上益城郡益城町」）を
正規化して JISコードおよび世帯数を返すモジュール。
"""

import json
import csv
import os
import re
from typing import Dict, Any, Optional


class MasterDB:
    def __init__(self, seed_file_path: Optional[str] = None):
        self.records: List[Dict[str, Any]] = []

        if seed_file_path is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            json_path = os.path.join(base_dir, "seeds", "municipalities_master.json")
            csv_path = os.path.join(base_dir, "seeds", "municipalities_master.csv")
            
            if os.path.exists(json_path):
                seed_file_path = json_path
            elif os.path.exists(csv_path):
                seed_file_path = csv_path

        if seed_file_path and os.path.exists(seed_file_path):
            self.load_seed(seed_file_path)
        else:
            self._load_fallback_data()

    def load_seed(self, file_path: str):
        """JSONまたはCSVからシードデータを読み込む"""
        if file_path.endswith(".json"):
            with open(file_path, "r", encoding="utf-8") as f:
                self.records = json.load(f)
        elif file_path.endswith(".csv"):
            with open(file_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    aliases = [a.strip() for a in row.get("aliases", "").split("|") if a.strip()]
                    self.records.append({
                        "year": int(row.get("year", 2026)),
                        "jis_code": row["jis_code"],
                        "prefecture": row["prefecture"],
                        "city_name": row["city_name"],
                        "total_households": int(row["total_households"]),
                        "total_population": int(row["total_population"]),
                        "total_buildings": int(row["total_buildings"]),
                        "aliases": aliases
                    })

    def _load_fallback_data(self):
        """ファイルが存在しない場合のデフォルト組込みデータ"""
        self.records = [
            {
                "year": 2016, "jis_code": "43201", "prefecture": "熊本県", "city_name": "熊本市",
                "total_households": 320000, "total_population": 738000, "total_buildings": 340000,
                "aliases": ["熊本市", "熊本市中央区", "熊本市東区", "熊本"]
            },
            {
                "year": 2016, "jis_code": "43441", "prefecture": "熊本県", "city_name": "益城町",
                "total_households": 13500, "total_population": 34000, "total_buildings": 14200,
                "aliases": ["益城町", "熊本県上益城郡益城町", "上益城郡益城町", "益城"]
            },
            {
                "year": 2026, "jis_code": "43201", "prefecture": "熊本県", "city_name": "熊本市",
                "total_households": 338000, "total_population": 738000, "total_buildings": 395000,
                "aliases": ["熊本市", "熊本市中央区", "熊本"]
            },
            {
                "year": 2026, "jis_code": "43441", "prefecture": "熊本県", "city_name": "益城町",
                "total_households": 15800, "total_population": 34800, "total_buildings": 16500,
                "aliases": ["益城町", "益城"]
            }
        ]

    def resolve(self, raw_name: str, target_year: int = 2026) -> Optional[Dict[str, Any]]:
        """
        自治体名と災害発生年で表記ゆらぎを吸収し、災害発生直前の最大年度マスター情報を返す
        """
        if not raw_name or not isinstance(raw_name, str):
            return None

        clean_name = raw_name.strip()
        stripped = re.sub(r'^(熊本県|石川県|宮城県|東京都|大阪府|福岡県|大分県)', '', clean_name)
        stripped = re.sub(r'^[一-龠ぁ-んァ-ヶ]+郡', '', stripped)

        candidates = []
        for r in self.records:
            match_city = (r["city_name"] == clean_name or r["city_name"] == stripped)
            match_alias = any(a == clean_name or a == stripped for a in r.get("aliases", []))
            match_partial = (clean_name in r["city_name"] or r["city_name"] in clean_name)
            if match_city or match_alias or match_partial:
                candidates.append(r)

        if not candidates:
            return None

        valid_by_year = [c for c in candidates if c.get("year", 2026) <= target_year]
        if valid_by_year:
            valid_by_year.sort(key=lambda x: x.get("year", 2026), reverse=True)
            return valid_by_year[0]

        candidates.sort(key=lambda x: x.get("year", 2026))
        return candidates[0]

    def get_households(self, raw_name: str, target_year: int = 2026) -> Optional[int]:
        """自治体名と災害年次から世帯数（分母）を取得"""
        record = self.resolve(raw_name, target_year)
        return record["total_households"] if record else None


# シンジングルトンインスタンス
_db_instance = MasterDB()

def resolve_municipality(raw_name: str, target_year: int = 2026) -> Optional[Dict[str, Any]]:
    """自治体名のゆらぎを吸収してJISコードとマスター情報を返すヘルパー関数"""
    return _db_instance.resolve(raw_name, target_year)

def get_households(raw_name: str, target_year: int = 2026) -> Optional[int]:
    """自治体名から世帯数を返すヘルパー関数"""
    return _db_instance.get_households(raw_name, target_year)


# 単体動作テスト
if __name__ == "__main__":
    print("=== MasterDB (master_db.py) 名寄せテスト ===")
    test_names = [
        "益城町",
        "熊本県益城町",
        "熊本県上益城郡益城町",
        "益城",
        "熊本市",
        "西原村",
        "未知の自治体名"
    ]

    for name in test_names:
        result = resolve_municipality(name)
        if result:
            print(f"入力: '{name}' -> JISコード: {result['jis_code']} | 正式名称: {result['prefecture']}{result['city_name']} | 世帯数: {result['total_households']:,}戸")
        else:
            print(f"入力: '{name}' -> ❌ 判定失敗")
