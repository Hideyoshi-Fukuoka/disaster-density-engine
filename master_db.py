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
        self.jis_map: Dict[str, Dict[str, Any]] = {}
        self.alias_map: Dict[str, Dict[str, Any]] = {}

        # デフォルトのシードデータパス決定
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
                records = json.load(f)
                for record in records:
                    self._register_record(record)
        elif file_path.endswith(".csv"):
            with open(file_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    aliases = [a.strip() for a in row.get("aliases", "").split("|") if a.strip()]
                    record = {
                        "jis_code": row["jis_code"],
                        "prefecture": row["prefecture"],
                        "city_name": row["city_name"],
                        "total_households": int(row["total_households"]),
                        "total_population": int(row["total_population"]),
                        "total_buildings": int(row["total_buildings"]),
                        "aliases": aliases
                    }
                    self._register_record(record)

    def _register_record(self, record: Dict[str, Any]):
        jis_code = record["jis_code"]
        pref = record.get("prefecture", "")
        city = record.get("city_name", "")

        self.jis_map[jis_code] = record

        # 名寄せ用エイリアスマップへのインデックス構築
        self.alias_map[city] = record
        self.alias_map[f"{pref}{city}"] = record

        for alias in record.get("aliases", []):
            self.alias_map[alias] = record
            self.alias_map[f"{pref}{alias}"] = record

    def _load_fallback_data(self):
        """ファイルが存在しない場合のデフォルト組込みデータ"""
        default_records = [
            {
                "jis_code": "43201", "prefecture": "熊本県", "city_name": "熊本市",
                "total_households": 320000, "total_population": 738000, "total_buildings": 340000,
                "aliases": ["熊本市", "熊本市中央区", "熊本市東区", "熊本"]
            },
            {
                "jis_code": "43441", "prefecture": "熊本県", "city_name": "益城町",
                "total_households": 13500, "total_population": 34000, "total_buildings": 14200,
                "aliases": ["益城町", "熊本県上益城郡益城町", "上益城郡益城町", "益城"]
            },
            {
                "jis_code": "43443", "prefecture": "熊本県", "city_name": "西原村",
                "total_households": 2600, "total_population": 6800, "total_buildings": 2750,
                "aliases": ["西原村", "阿蘇郡西原村", "西原"]
            }
        ]
        for r in default_records:
            self._register_record(r)

    def resolve(self, raw_name: str) -> Optional[Dict[str, Any]]:
        """
        自治体名（例: '益城町', '熊本県益城町', '熊本県上益城郡益城町'）の表記ゆらぎを吸収し
        JISコード、正式名称、世帯数などの情報を返す。
        """
        if not raw_name or not isinstance(raw_name, str):
            return None

        clean_name = raw_name.strip()

        # 1. 完全一致/エイリアス一致
        if clean_name in self.alias_map:
            return self.alias_map[clean_name]

        # 2. 都道府県名や郡名の正規化除去（「熊本県」「上益城郡」などを取り除いて判定）
        stripped = re.sub(r'^(熊本県|石川県|宮城県|東京都|大阪府|福岡県|大分県)', '', clean_name)
        stripped = re.sub(r'^[一-龠ぁ-んァ-ヶ]+郡', '', stripped)

        if stripped in self.alias_map:
            return self.alias_map[stripped]

        # 3. 部分一致検索
        for alias, record in self.alias_map.items():
            if clean_name in alias or alias in clean_name:
                return record

        return None

    def get_households(self, raw_name: str) -> Optional[int]:
        """自治体名から世帯数（分母）を取得"""
        record = self.resolve(raw_name)
        return record["total_households"] if record else None


# シンジングルトンインスタンス
_db_instance = MasterDB()

def resolve_municipality(raw_name: str) -> Optional[Dict[str, Any]]:
    """自治体名のゆらぎを吸収してJISコードとマスター情報を返すヘルパー関数"""
    return _db_instance.resolve(raw_name)

def get_households(raw_name: str) -> Optional[int]:
    """自治体名から世帯数を返すヘルパー関数"""
    return _db_instance.get_households(raw_name)


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
