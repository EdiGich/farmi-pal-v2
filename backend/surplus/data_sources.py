import httpx
import csv
import io
from datetime import datetime, timedelta
from dataclasses import dataclass
from typing import Optional
from django.core.cache import cache


@dataclass
class WeatherData:
    forecast_14d_mm: float
    anomaly_pct: float
    temp_max_avg: float
    historical_monthly_mm: dict
    drought_months_last_12: int


def get_weather_data(lat: float, lon: float) -> WeatherData:
    cache_key = f"weather:{lat:.2f}:{lon:.2f}"
    if cached := cache.get(cache_key):
        return cached

    forecast_resp = httpx.get(
        "https://api.open-meteo.com/v1/forecast",
        params={
            "latitude": lat, "longitude": lon,
            "daily": "precipitation_sum,temperature_2m_max",
            "forecast_days": 14, "timezone": "Africa/Nairobi"
        }, timeout=10
    )
    forecast = forecast_resp.json()
    forecast_14d = sum(forecast["daily"]["precipitation_sum"])
    temp_max_avg = sum(forecast["daily"]["temperature_2m_max"]) / 14

    today = datetime.today()
    historical_monthly: dict[int, list[float]] = {}
    year_count = 0

    for year_offset in range(1, 11):
        year = today.year - year_offset
        start = f"{year}-01-01"
        end = f"{year}-12-31"

        try:
            hist_resp = httpx.get(
                "https://archive-api.open-meteo.com/v1/archive",
                params={
                    "latitude": lat, "longitude": lon,
                    "start_date": start, "end_date": end,
                    "daily": "precipitation_sum",
                    "timezone": "Africa/Nairobi"
                }, timeout=15
            )
            hist_resp.raise_for_status()
            hist = hist_resp.json()
        except Exception:
            continue

        year_count += 1
        for date_str, rain in zip(hist["daily"]["time"], hist["daily"]["precipitation_sum"]):
            month = int(date_str[5:7])
            historical_monthly.setdefault(month, []).append(rain or 0)

    monthly_avg = {}
    for month, daily_values in historical_monthly.items():
        avg_daily = sum(daily_values) / max(len(daily_values), 1)
        monthly_avg[month] = avg_daily * 30

    drought_months = 0
    last_hist = None
    try:
        last_resp = httpx.get(
            "https://archive-api.open-meteo.com/v1/archive",
            params={
                "latitude": lat, "longitude": lon,
                "start_date": (today.year - 1), "end_date": (today.year - 1),
                "daily": "precipitation_sum",
                "timezone": "Africa/Nairobi"
            }, timeout=15
        )
        last_hist = last_resp.json()
    except Exception:
        pass

    if last_hist:
        for m in range(1, 13):
            avg = monthly_avg.get(m, 0)
            if avg > 80:
                current_m_rain = sum(
                    r for d, r in zip(last_hist["daily"]["time"], last_hist["daily"]["precipitation_sum"])
                    if int(d[5:7]) == m
                )
                if current_m_rain < avg * 0.5:
                    drought_months += 1

    this_month = today.month
    avg_14d = monthly_avg.get(this_month, 1) * (14 / 30)
    anomaly_pct = ((forecast_14d - avg_14d) / max(avg_14d, 1)) * 100

    result = WeatherData(
        forecast_14d_mm=round(forecast_14d, 1),
        anomaly_pct=round(anomaly_pct, 1),
        temp_max_avg=round(temp_max_avg, 1),
        historical_monthly_mm=monthly_avg,
        drought_months_last_12=drought_months
    )
    cache.set(cache_key, result, timeout=3600 * 6)
    return result


@dataclass
class EnsoData:
    phase: str
    oni_value: float
    trend: str
    east_africa_effect: str


def get_enso_data() -> EnsoData:
    cached = cache.get("enso_data")
    if cached:
        return cached

    resp = httpx.get(
        "https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt",
        timeout=10
    )
    lines = [l for l in resp.text.strip().split("\n") if l.strip() and not l.startswith("SEAS")]

    readings = []
    for line in lines[-3:]:
        parts = line.split()
        if len(parts) >= 4:
            try:
                readings.append(float(parts[3]))
            except ValueError:
                pass

    oni = readings[-1] if readings else 0.0
    trend = "stable"
    if len(readings) >= 2:
        delta = readings[-1] - readings[-2]
        if delta > 0.1:
            trend = "strengthening"
        elif delta < -0.1:
            trend = "weakening"

    if oni >= 0.5:
        phase = "el_nino"
        east_africa_effect = "surplus_risk"
    elif oni <= -0.5:
        phase = "la_nina"
        east_africa_effect = "deficit_risk"
    else:
        phase = "neutral"
        east_africa_effect = "neutral"

    result = EnsoData(phase=phase, oni_value=oni, trend=trend,
                      east_africa_effect=east_africa_effect)
    cache.set("enso_data", result, timeout=3600 * 24)
    return result


def get_fao_price_history(crop: str = "Maize", country_code: str = "KEN") -> dict:
    cache_key = f"fao_prices:{country_code}:{crop}"
    if cached := cache.get(cache_key):
        return cached

    url = "https://fpma.apps.fao.org/giews/food-prices/tool/public/api/v1/prices"
    resp = httpx.get(url, params={
        "country": country_code,
        "commodity": crop,
        "markets": "all"
    }, timeout=10)

    if resp.status_code != 200:
        return {"prices": [], "error": "FAO API unavailable"}

    data = resp.json()
    cache.set(cache_key, data, timeout=3600 * 12)
    return data


def get_chirps_anomaly(county: str) -> Optional[float]:
    cache_key = f"chirps:{county}"
    if cached := cache.get(cache_key):
        return cached

    url = ("https://data.humdata.org/dataset/"
           "east-africa-chirps-seasonal-rainfall-accumulation-anomaly-by-pentad/"
           "resource/subnational_anomaly_statistics.csv")

    try:
        resp = httpx.get(url, timeout=15, follow_redirects=True)
        reader = csv.DictReader(io.StringIO(resp.text))
        for row in reader:
            if county.lower() in row.get("name", "").lower():
                anomaly = float(row.get("mean", 0))
                cache.set(cache_key, anomaly, timeout=3600 * 12)
                return anomaly
    except Exception:
        pass

    return None
