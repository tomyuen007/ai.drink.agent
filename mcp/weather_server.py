import requests
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("weather")

WMO_CODES = {
    0: "Clear sky",
    1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Freezing fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
    85: "Slight snow showers", 86: "Heavy snow showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail",
}


def _geocode(city: str) -> dict:
    resp = requests.get(
        "https://geocoding-api.open-meteo.com/v1/search",
        params={"name": city, "count": 1, "language": "en", "format": "json"},
        timeout=10,
    )
    resp.raise_for_status()
    results = resp.json().get("results", [])
    if not results:
        return {}
    r = results[0]
    return {
        "name": r["name"],
        "country": r.get("country", ""),
        "latitude": r["latitude"],
        "longitude": r["longitude"],
    }


@mcp.tool()
def get_current_weather(city: str) -> dict:
    """Get current weather conditions for a city (temperature, humidity, wind, condition)."""
    loc = _geocode(city)
    if not loc:
        return {"error": f"City not found: {city}"}

    resp = requests.get(
        "https://api.open-meteo.com/v1/forecast",
        params={
            "latitude": loc["latitude"],
            "longitude": loc["longitude"],
            "current": (
                "temperature_2m,apparent_temperature,relative_humidity_2m,"
                "wind_speed_10m,weather_code,precipitation,uv_index"
            ),
            "wind_speed_unit": "kmh",
            "temperature_unit": "celsius",
            "timezone": "auto",
        },
        timeout=10,
    )
    resp.raise_for_status()
    current = resp.json().get("current", {})
    code = current.get("weather_code", -1)

    return {
        "city": f"{loc['name']}, {loc['country']}",
        "condition": WMO_CODES.get(code, "Unknown"),
        "temperature_c": current.get("temperature_2m"),
        "feels_like_c": current.get("apparent_temperature"),
        "humidity_pct": current.get("relative_humidity_2m"),
        "wind_speed_kmh": current.get("wind_speed_10m"),
        "precipitation_mm": current.get("precipitation"),
        "uv_index": current.get("uv_index"),
    }


@mcp.tool()
def get_forecast(city: str, days: int = 3) -> dict:
    """Get daily weather forecast for a city. days must be between 1 and 7."""
    days = max(1, min(days, 7))
    loc = _geocode(city)
    if not loc:
        return {"error": f"City not found: {city}"}

    resp = requests.get(
        "https://api.open-meteo.com/v1/forecast",
        params={
            "latitude": loc["latitude"],
            "longitude": loc["longitude"],
            "daily": (
                "weather_code,temperature_2m_max,temperature_2m_min,"
                "precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max"
            ),
            "forecast_days": days,
            "wind_speed_unit": "kmh",
            "temperature_unit": "celsius",
            "timezone": "auto",
        },
        timeout=10,
    )
    resp.raise_for_status()
    daily = resp.json().get("daily", {})

    forecast = []
    for i, date in enumerate(daily.get("time", [])):
        code = daily.get("weather_code", [])[i] if daily.get("weather_code") else -1
        def _get(key):
            vals = daily.get(key, [])
            return vals[i] if i < len(vals) else None

        forecast.append({
            "date": date,
            "condition": WMO_CODES.get(code, "Unknown"),
            "temp_max_c": _get("temperature_2m_max"),
            "temp_min_c": _get("temperature_2m_min"),
            "precipitation_mm": _get("precipitation_sum"),
            "precipitation_probability_pct": _get("precipitation_probability_max"),
            "wind_speed_max_kmh": _get("wind_speed_10m_max"),
            "uv_index_max": _get("uv_index_max"),
        })

    return {
        "city": f"{loc['name']}, {loc['country']}",
        "forecast": forecast,
    }


if __name__ == "__main__":
    mcp.run()
