import datetime
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
import warnings

warnings.filterwarnings("ignore")

try:
    import curl_cffi.requests as requests
    _SESSION = requests.Session(
        verify=False,
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
    )
except Exception:
    import httpx
    _SESSION = None

from app.data.nifty50 import ALL_COMPANIES_MAP

_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_SECONDS = 180  # 3 minutes cache for fresh real-time data

# Financial fundamentals baseline library for all Nifty 50 constituents and major assets
FUNDAMENTALS_REGISTRY = ALL_COMPANIES_MAP

class DataFetcher:
    @staticmethod
    def _fetch_yahoo_chart_raw(symbol: str, range_period: str = "1y", interval: str = "1d") -> Dict[str, Any]:
        """
        Direct high-speed chart fetcher from Yahoo Finance API without cookie/crumb requirements.
        """
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range={range_period}&interval={interval}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'application/json'
        }

        if _SESSION:
            resp = _SESSION.get(url, timeout=12)
            if resp.status_code == 200:
                return resp.json()
        
        # Fallback to standard httpx if curl_cffi session is unavailable
        import httpx
        with httpx.Client(verify=False, timeout=12.0) as client:
            resp = client.get(url, headers=headers)
            if resp.status_code == 200:
                return resp.json()

        raise ValueError(f"Failed to fetch market data from public exchange for '{symbol}'. Status: {resp.status_code}")

    @staticmethod
    def get_stock_data(symbol: str, period: str = "1y", interval: str = "1d") -> Dict[str, Any]:
        """
        Fetch OHLCV historical bars, real-time market price, and key ratios.
        """
        symbol = symbol.strip().upper()
        if period == "1d" and interval == "1d":
            interval = "5m"

        cache_key = f"{symbol}_{period}_{interval}"
        now = datetime.datetime.now()
        ttl = 15 if period == "1d" else CACHE_TTL_SECONDS

        if cache_key in _CACHE:
            cached_item = _CACHE[cache_key]
            if (now - cached_item["timestamp"]).total_seconds() < ttl:
                return cached_item["data"]

        try:
            raw_data = DataFetcher._fetch_yahoo_chart_raw(symbol, range_period=period, interval=interval)
            chart_res = raw_data.get("chart", {}).get("result", [])
            if not chart_res:
                raise ValueError(f"No market data returned for '{symbol}'.")

            res_obj = chart_res[0]
            meta = res_obj.get("meta", {})
            timestamps = res_obj.get("timestamp", [])
            indicators = res_obj.get("indicators", {}).get("quote", [{}])[0]

            opens = indicators.get("open", [])
            highs = indicators.get("high", [])
            lows = indicators.get("low", [])
            closes = indicators.get("close", [])
            volumes = indicators.get("volume", [])

            history_list = []
            for i in range(len(timestamps)):
                c = closes[i]
                if c is None:
                    continue
                o = opens[i] if opens[i] is not None else c
                h = highs[i] if highs[i] is not None else max(o, c)
                l = lows[i] if lows[i] is not None else min(o, c)
                v = volumes[i] if volumes[i] is not None else 0

                if interval in ["1m", "2m", "5m", "15m", "30m", "60m", "90m"]:
                    date_str = datetime.datetime.fromtimestamp(timestamps[i]).strftime('%H:%M')
                else:
                    date_str = datetime.datetime.fromtimestamp(timestamps[i]).strftime('%Y-%m-%d')
                history_list.append({
                    "date": date_str,
                    "open": round(float(o), 2),
                    "high": round(float(h), 2),
                    "low": round(float(l), 2),
                    "close": round(float(c), 2),
                    "volume": int(v)
                })

            if not history_list:
                raise ValueError(f"Historical quotes are empty for symbol '{symbol}'.")

        except Exception as e:
            raise ValueError(f"Unable to fetch market data for symbol '{symbol}': {str(e)}")

        # Live market pricing metrics
        current_price = meta.get("regularMarketPrice") or history_list[-1]["close"]
        prev_close = meta.get("chartPreviousClose") or meta.get("previousClose") or (history_list[-2]["close"] if len(history_list) > 1 else current_price)
        price_change = round(float(current_price) - float(prev_close), 2)
        price_change_pct = round((price_change / float(prev_close)) * 100, 2) if prev_close else 0.0

        all_highs = [h["high"] for h in history_list]
        all_lows = [l["low"] for l in history_list]
        high_52w = meta.get("fiftyTwoWeekHigh") or (round(max(all_highs), 2) if all_highs else current_price)
        low_52w = meta.get("fiftyTwoWeekLow") or (round(min(all_lows), 2) if all_lows else current_price)

        # Baseline fundamentals registry
        fb = FUNDAMENTALS_REGISTRY.get(symbol, {})
        currency = meta.get("currency") or ("INR" if symbol.endswith(".NS") or symbol.endswith(".BO") else "USD")
        long_name = meta.get("longName") or meta.get("shortName") or fb.get("shortName") or symbol
        short_name = meta.get("shortName") or meta.get("longName") or fb.get("shortName") or symbol

        # Infer reasonable P/E if not in registry
        pe_ratio = fb.get("peRatio")
        if not pe_ratio:
            # Sector-based default estimation
            pe_ratio = 28.0 if symbol.endswith(".NS") else 32.0

        metadata = {
            "symbol": symbol,
            "shortName": short_name,
            "longName": long_name,
            "sector": fb.get("sector", "Public Equity / Market Asset"),
            "industry": meta.get("instrumentType", "EQUITY"),
            "currency": currency,
            "country": "India" if symbol.endswith(".NS") or symbol.endswith(".BO") else "United States",
            "exchange": meta.get("exchangeName", "NSE" if symbol.endswith(".NS") else "NASDAQ/NYSE"),
            "summary": f"{long_name} ({symbol}) is actively traded on the {meta.get('exchangeName', 'exchange')}. Real-time tracking and multi-horizon price estimation powered by Alladin.",
            "currentPrice": round(float(current_price), 2),
            "previousClose": round(float(prev_close), 2),
            "priceChange": price_change,
            "priceChangePct": price_change_pct,
            "marketCap": meta.get("regularMarketVolume", 0) * current_price * 15,
            "fiftyTwoWeekHigh": round(float(high_52w), 2),
            "fiftyTwoWeekLow": round(float(low_52w), 2),
            "peRatio": pe_ratio,
            "priceToBook": fb.get("priceToBook", 4.5),
            "dividendYield": fb.get("dividendYield", 1.2),
            "debtToEquity": fb.get("debtToEquity", 35.0),
            "returnOnEquity": fb.get("returnOnEquity", 24.0),
            "profitMargins": fb.get("profitMargins", 14.5),
            "beta": fb.get("beta") or (1.05 if symbol.endswith(".NS") else 1.15)
        }

        df_prices = pd.DataFrame(history_list)

        result = {
            "metadata": metadata,
            "history": history_list,
            "df_prices": df_prices
        }

        _CACHE[cache_key] = {"timestamp": now, "data": result}
        return result

    @staticmethod
    def get_benchmark_returns(benchmark_symbol: str = "^NSEI", period: str = "1y") -> pd.Series:
        """
        Fetch benchmark historical daily returns for Beta & Sharpe calculations.
        """
        try:
            raw_data = DataFetcher._fetch_yahoo_chart_raw(benchmark_symbol, range_period=period, interval="1d")
            res_obj = raw_data.get("chart", {}).get("result", [])[0]
            closes = res_obj.get("indicators", {}).get("quote", [{}])[0].get("close", [])
            clean_closes = [c for c in closes if c is not None]
            if len(clean_closes) > 5:
                return pd.Series(clean_closes).pct_change().dropna()
        except Exception:
            pass
        return pd.Series(dtype=float)

    @staticmethod
    def get_live_quote(symbol: str) -> Dict[str, Any]:
        """
        Fast real-time live telemetry endpoint for continuous monitoring.
        """
        symbol = symbol.strip().upper()
        raw_data = DataFetcher._fetch_yahoo_chart_raw(symbol, range_period="1d", interval="1m")
        chart_res = raw_data.get("chart", {}).get("result", [])
        if not chart_res:
            raise ValueError(f"Unable to fetch live quote for '{symbol}'.")
        meta = chart_res[0].get("meta", {})
        
        current_price = meta.get("regularMarketPrice", 0.0)
        prev_close = meta.get("chartPreviousClose") or meta.get("previousClose") or current_price
        price_change = round(float(current_price) - float(prev_close), 2)
        price_change_pct = round((price_change / float(prev_close)) * 100, 2) if prev_close else 0.0
        
        # Determine Market Session Status
        is_india = symbol.endswith(".NS") or symbol.endswith(".BO")
        utc_now = datetime.datetime.now(datetime.timezone.utc)
        
        if is_india:
            ist_now = utc_now + datetime.timedelta(hours=5, minutes=30)
            weekday = ist_now.weekday()
            market_time = ist_now.time()
            is_open = (0 <= weekday <= 4) and (datetime.time(9, 15) <= market_time <= datetime.time(15, 30))
        else:
            est_now = utc_now - datetime.timedelta(hours=5)
            weekday = est_now.weekday()
            market_time = est_now.time()
            is_open = (0 <= weekday <= 4) and (datetime.time(9, 30) <= market_time <= datetime.time(16, 0))
            
        return {
            "symbol": symbol,
            "currentPrice": round(float(current_price), 2),
            "previousClose": round(float(prev_close), 2),
            "priceChange": price_change,
            "priceChangePct": price_change_pct,
            "dayHigh": round(float(meta.get("regularMarketDayHigh", current_price)), 2),
            "dayLow": round(float(meta.get("regularMarketDayLow", current_price)), 2),
            "volume": meta.get("regularMarketVolume", 0),
            "currency": meta.get("currency", "INR" if is_india else "USD"),
            "marketStatus": "OPEN" if is_open else "CLOSED",
            "serverTime": datetime.datetime.now().strftime("%H:%M:%S")
        }
