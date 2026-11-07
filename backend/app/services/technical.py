import pandas as pd
import numpy as np
from typing import Dict, Any, List

class TechnicalEngine:
    @staticmethod
    def calculate_indicators(df_prices: pd.DataFrame) -> Dict[str, Any]:
        """
        Calculate technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands).
        """
        if df_prices.empty or "close" not in df_prices.columns or len(df_prices) < 20:
            return {
                "signal": "NEUTRAL",
                "indicators": {},
                "summary": "Insufficient price history for technical analysis."
            }

        df = df_prices.copy()
        close = df["close"]

        # Simple Moving Averages
        df["sma20"] = close.rolling(window=20).mean()
        df["sma50"] = close.rolling(window=50).mean()
        df["sma200"] = close.rolling(window=200).mean()

        # Relative Strength Index (RSI 14)
        delta = close.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss.replace(0, np.nan)
        df["rsi"] = 100 - (100 / (1 + rs))

        # MACD (12, 26, 9)
        ema12 = close.ewm(span=12, adjust=False).mean()
        ema26 = close.ewm(span=26, adjust=False).mean()
        df["macd"] = ema12 - ema26
        df["macd_signal"] = df["macd"].ewm(span=9, adjust=False).mean()
        df["macd_hist"] = df["macd"] - df["macd_signal"]

        # Bollinger Bands (20, 2)
        sma20 = df["sma20"]
        std20 = close.rolling(window=20).std()
        df["bb_upper"] = sma20 + (std20 * 2)
        df["bb_lower"] = sma20 - (std20 * 2)

        # Extract latest values
        latest = df.iloc[-1]
        prev = df.iloc[-2] if len(df) > 1 else latest

        current_close = float(latest["close"])
        rsi_val = float(latest["rsi"]) if not pd.isna(latest["rsi"]) else 50.0
        sma20_val = float(latest["sma20"]) if not pd.isna(latest["sma20"]) else current_close
        sma50_val = float(latest["sma50"]) if not pd.isna(latest["sma50"]) else current_close
        sma200_val = float(latest["sma200"]) if not pd.isna(latest["sma200"]) else current_close
        macd_val = float(latest["macd"]) if not pd.isna(latest["macd"]) else 0.0
        macd_sig_val = float(latest["macd_signal"]) if not pd.isna(latest["macd_signal"]) else 0.0

        # Technical Signal Evaluation
        bullish_signals = 0
        bearish_signals = 0

        # RSI Signal
        if rsi_val < 30:
            rsi_status = "Oversold (< 30) - Potential Reversal"
            bullish_signals += 1
        elif rsi_val > 70:
            rsi_status = "Overbought (> 70) - Caution Advisable"
            bearish_signals += 1
        else:
            rsi_status = "Neutral (30-70)"

        # SMA Trend Alignment
        if current_close > sma50_val:
            bullish_signals += 1
        else:
            bearish_signals += 1

        if current_close > sma200_val:
            bullish_signals += 1
        else:
            bearish_signals += 1

        # MACD Crossover
        if macd_val > macd_sig_val:
            macd_status = "Bullish Crossover"
            bullish_signals += 1
        else:
            macd_status = "Bearish Crossover"
            bearish_signals += 1

        overall_signal = "BULLISH" if bullish_signals > bearish_signals + 1 else "BEARISH" if bearish_signals > bullish_signals + 1 else "NEUTRAL"

        # Format historical indicator overlays for charts
        chart_series = []
        for idx, row in df.iterrows():
            close_val = round(float(row["close"]), 2)
            open_val = round(float(row["open"]), 2) if "open" in row and not pd.isna(row["open"]) else close_val
            high_val = round(float(row["high"]), 2) if "high" in row and not pd.isna(row["high"]) else close_val
            low_val = round(float(row["low"]), 2) if "low" in row and not pd.isna(row["low"]) else close_val
            vol_val = int(row["volume"]) if "volume" in row and not pd.isna(row["volume"]) else 0

            chart_series.append({
                "date": str(row["date"]),
                "close": close_val,
                "open": open_val,
                "high": high_val,
                "low": low_val,
                "volume": vol_val,
                "sma20": round(float(row["sma20"]), 2) if not pd.isna(row["sma20"]) else None,
                "sma50": round(float(row["sma50"]), 2) if not pd.isna(row["sma50"]) else None,
                "sma200": round(float(row["sma200"]), 2) if not pd.isna(row["sma200"]) else None,
                "rsi": round(float(row["rsi"]), 2) if not pd.isna(row["rsi"]) else None,
                "macd": round(float(row["macd"]), 2) if not pd.isna(row["macd"]) else None,
                "macd_signal": round(float(row["macd_signal"]), 2) if not pd.isna(row["macd_signal"]) else None
            })

        return {
            "overallSignal": overall_signal,
            "rsi": round(rsi_val, 2),
            "rsiStatus": rsi_status,
            "sma20": round(sma20_val, 2),
            "sma50": round(sma50_val, 2),
            "sma200": round(sma200_val, 2),
            "macd": round(macd_val, 2),
            "macdSignal": round(macd_sig_val, 2),
            "macdStatus": macd_status,
            "bbUpper": round(float(latest["bb_upper"]), 2) if not pd.isna(latest["bb_upper"]) else None,
            "bbLower": round(float(latest["bb_lower"]), 2) if not pd.isna(latest["bb_lower"]) else None,
            "chartSeries": chart_series
        }
