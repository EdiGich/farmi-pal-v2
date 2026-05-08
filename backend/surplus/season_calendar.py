from datetime import datetime
from typing import Optional

COUNTY_HARVEST_CALENDAR = {
    "trans_nzoia":     {"peak_harvest": [11, 12], "planting": [3, 4],  "season": "unimodal"},
    "uasin_gishu":     {"peak_harvest": [10, 11], "planting": [3, 4],  "season": "unimodal"},
    "elgeyo_marakwet": {"peak_harvest": [10, 11], "planting": [3, 4],  "season": "unimodal"},
    "nandi":           {"peak_harvest": [10, 11], "planting": [3, 4],  "season": "unimodal"},
    "west_pokot":      {"peak_harvest": [10, 11], "planting": [3, 4],  "season": "unimodal"},
    "nakuru":          {"peak_harvest": [10, 11], "planting": [3, 4],  "season": "unimodal"},
    "laikipia":        {"peak_harvest": [10, 11], "planting": [3, 4],  "season": "unimodal"},
    "kakamega":        {"peak_harvest": [7, 8, 1, 2],  "planting": [3, 4, 10, 11], "season": "bimodal"},
    "bungoma":         {"peak_harvest": [7, 8, 1, 2],  "planting": [3, 4, 10, 11], "season": "bimodal"},
    "busia":           {"peak_harvest": [7, 8, 1, 2],  "planting": [3, 4, 10, 11], "season": "bimodal"},
    "vihiga":          {"peak_harvest": [7, 8, 1, 2],  "planting": [3, 4, 10, 11], "season": "bimodal"},
    "kisumu":          {"peak_harvest": [7, 8, 1, 2],  "planting": [3, 4, 10, 11], "season": "bimodal"},
    "siaya":           {"peak_harvest": [7, 8, 1, 2],  "planting": [3, 4, 10, 11], "season": "bimodal"},
    "kisii":           {"peak_harvest": [7, 8, 1, 2],  "planting": [3, 4, 10, 11], "season": "bimodal"},
    "migori":          {"peak_harvest": [7, 8, 1, 2],  "planting": [3, 4, 10, 11], "season": "bimodal"},
    "machakos":        {"peak_harvest": [6, 7, 1, 2],  "planting": [3, 4, 10, 11], "season": "bimodal"},
    "makueni":         {"peak_harvest": [6, 7, 1, 2],  "planting": [3, 4, 10, 11], "season": "bimodal"},
    "kitui":           {"peak_harvest": [6, 7, 1, 2],  "planting": [3, 4, 10, 11], "season": "bimodal"},
    "nyeri":           {"peak_harvest": [8, 9, 1, 2],  "planting": [3, 4, 10, 11], "season": "bimodal"},
    "kirinyaga":       {"peak_harvest": [8, 9, 1, 2],  "planting": [3, 4, 10, 11], "season": "bimodal"},
    "muranga":         {"peak_harvest": [8, 9, 1, 2],  "planting": [3, 4, 10, 11], "season": "bimodal"},
}

NORTH_RIFT_COUNTIES = ["trans_nzoia", "uasin_gishu", "elgeyo_marakwet", "nandi", "nakuru"]

ROAD_RISK_SEASON = {
    "kakamega":     [4, 5, 6],
    "bungoma":      [4, 5, 6],
    "busia":        [4, 5, 6],
    "trans_nzoia":  [10, 11, 12],
    "uasin_gishu":  [10, 11, 12],
}

REGIONAL_HARVEST = {
    "tanzania": {"maize": [5, 6, 7, 8]},
    "uganda":   {"maize": [8, 9, 10]},
    "zambia":   {"maize": [4, 5, 6]},
}


class SeasonCalendar:
    def __init__(self):
        self.today = datetime.today()

    def _normalize(self, region: str) -> str:
        return region.lower().replace(" ", "_").replace("-", "_")

    def is_peak_harvest(self, crop: str, region: str) -> bool:
        key = self._normalize(region)
        cal = COUNTY_HARVEST_CALENDAR.get(key)
        if not cal:
            return False
        return self.today.month in cal["peak_harvest"]

    def weeks_to_harvest(self, crop: str, region: str) -> Optional[int]:
        key = self._normalize(region)
        cal = COUNTY_HARVEST_CALENDAR.get(key)
        if not cal:
            return None
        current = self.today.month
        for peak_month in sorted(cal["peak_harvest"]):
            if peak_month >= current:
                return (peak_month - current) * 4
        return (12 - current + min(cal["peak_harvest"])) * 4

    def harvesting_neighbor_counties(self, crop: str, region: str) -> list[str]:
        if self._normalize(region) in NORTH_RIFT_COUNTIES:
            return [c for c in NORTH_RIFT_COUNTIES
                    if self.is_peak_harvest(crop, c) and c != self._normalize(region)]
        return []

    def is_road_season_risk(self, region: str) -> bool:
        key = self._normalize(region)
        risky_months = ROAD_RISK_SEASON.get(key, [])
        return self.today.month in risky_months

    def regional_countries_harvesting(self, crop: str) -> list[str]:
        return [country for country, crops in REGIONAL_HARVEST.items()
                if crop.lower() in crops
                and self.today.month in crops[crop.lower()]]

    def get_current_season(self) -> str:
        m = self.today.month
        if 3 <= m <= 5:
            return "long_rains"
        elif 6 <= m <= 9:
            return "long_rains_harvest"
        elif 10 <= m <= 12:
            return "short_rains"
        else:
            return "dry"
