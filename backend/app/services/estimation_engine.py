import numpy as np
import pandas as pd
from typing import Dict, Any, List

class PriceEstimationEngine:
    @staticmethod
    def calculate_estimates(
        current_price: float,
        df_prices: pd.DataFrame,
        technicals: Dict[str, Any],
        risk: Dict[str, Any],
        fundamentals: Dict[str, Any],
        beta: float = 1.0,
        benchmark_trend: float = 0.004
    ) -> Dict[str, Any]:
        """
        Quantitatively estimate stock price projections across 1-day, 1-week, and 1-month horizons
        incorporating real-time momentum, volume pressure, volatility drift, and macro trends.
        """
        if df_prices.empty or "close" not in df_prices.columns or len(df_prices) < 15:
            # Fallback default estimations if history is minimal
            return PriceEstimationEngine._generate_fallback(current_price)

        closes = df_prices["close"].tolist()
        volumes = df_prices["volume"].tolist() if "volume" in df_prices.columns else [1000000] * len(closes)

        # 1. Historical Daily Returns & Volatility
        series_close = pd.Series(closes)
        returns = series_close.pct_change().dropna()
        daily_volatility = float(returns.std()) if len(returns) > 5 else 0.015
        if np.isnan(daily_volatility) or daily_volatility <= 0:
            daily_volatility = 0.015

        # 2. Short & Medium Term Momentum
        recent_10d_return = float((closes[-1] / closes[-10]) - 1) if len(closes) >= 10 else 0.0
        daily_momentum = recent_10d_return / 10.0

        # 3. Real-Time Impact Factor: RSI (Relative Strength Index)
        rsi = float(technicals.get("rsi", 50.0))
        if rsi < 32:
            rsi_drift = (32 - rsi) * 0.0006  # Positive rebound pull
            rsi_impact = f"RSI ({round(rsi, 1)}) is currently in oversold territory, providing upward rebound pressure."
            rsi_sentiment = "Bullish"
        elif rsi > 68:
            rsi_drift = -(rsi - 68) * 0.0006  # Pullback pressure
            rsi_impact = f"RSI ({round(rsi, 1)}) is in overbought territory, increasing short-term consolidation risk."
            rsi_sentiment = "Bearish"
        else:
            rsi_drift = (rsi - 50) * 0.0001
            rsi_impact = f"RSI ({round(rsi, 1)}) indicates balanced buyer-seller equilibrium."
            rsi_sentiment = "Neutral"

        # 4. Real-Time Impact Factor: Moving Average Distance & Mean Reversion
        sma50 = float(technicals.get("sma50") or current_price)
        sma200 = float(technicals.get("sma200") or current_price)
        sma_dist_pct = ((current_price - sma50) / sma50) * 100 if sma50 > 0 else 0.0

        if sma_dist_pct > 8:
            sma_reversion_pull = -0.012
            sma_impact = f"Price is extended {round(sma_dist_pct, 1)}% above 50-day SMA, indicating mean-reversion resistance."
            sma_sentiment = "Bearish"
        elif sma_dist_pct < -8:
            sma_reversion_pull = 0.015
            sma_impact = f"Price is discounted {round(abs(sma_dist_pct), 1)}% below 50-day SMA, providing mean-reversion lift."
            sma_sentiment = "Bullish"
        else:
            sma_reversion_pull = 0.002 if current_price >= sma50 else -0.002
            sma_impact = f"Price is tracking within normal distance ({round(sma_dist_pct, 1)}%) of the 50-day SMA ({round(sma50, 2)})."
            sma_sentiment = "Neutral"

        # 5. Real-Time Impact Factor: Volume Pressure
        vol_20 = float(np.mean(volumes[-20:])) if len(volumes) >= 20 else float(volumes[-1] or 1)
        current_vol = float(volumes[-1] or vol_20)
        vol_ratio = (current_vol / vol_20) if vol_20 > 0 else 1.0

        if vol_ratio > 1.3:
            vol_boost = 0.004 if daily_momentum >= 0 else -0.004
            vol_impact = f"Trading volume is {round(vol_ratio, 2)}x above the 20-day average, signaling institutional accumulation/distribution."
            vol_sentiment = "Bullish" if daily_momentum >= 0 else "Bearish"
        else:
            vol_boost = 0.0
            vol_impact = f"Trading volume is steady at {round(vol_ratio, 2)}x the 20-day baseline average."
            vol_sentiment = "Neutral"

        # 6. Real-Time Impact Factor: Macro Benchmark Drift & Beta
        macro_systematic_drift = beta * benchmark_trend
        macro_impact = f"Market Beta of {round(beta, 2)} transmits systematic index momentum into asset volatility."
        macro_sentiment = "Bullish" if macro_systematic_drift > 0 else "Bearish"

        # 7. Horizon Projections Configuration
        horizons_config = [
            {
                "key": "1day",
                "label": "1-Day Projection",
                "periodName": "Next Trading Session",
                "days": 1,
                "weight_momentum": 0.4,
                "weight_rsi": 0.5,
                "weight_sma": 0.1,
                "macro_scale": 0.2
            },
            {
                "key": "1week",
                "label": "1-Week Projection",
                "periodName": "5 Trading Days",
                "days": 5,
                "weight_momentum": 1.2,
                "weight_rsi": 1.5,
                "weight_sma": 0.8,
                "macro_scale": 1.0
            },
            {
                "key": "1month",
                "label": "1-Month Projection",
                "periodName": "21 Trading Days",
                "days": 21,
                "weight_momentum": 2.2,
                "weight_rsi": 1.0,
                "weight_sma": 2.5,
                "macro_scale": 2.0
            }
        ]

        estimates = {}
        for h in horizons_config:
            t_days = h["days"]

            # Compute combined expected return drift
            drift = (
                (daily_momentum * t_days * h["weight_momentum"]) +
                (rsi_drift * h["weight_rsi"]) +
                (sma_reversion_pull * h["weight_sma"]) +
                (vol_boost * (1 if t_days <= 5 else 0.5)) +
                (macro_systematic_drift * h["macro_scale"])
            )

            # Cap statistical bounds to realistic market limits
            max_bound = 0.05 if t_days == 1 else (0.12 if t_days == 5 else 0.25)
            bounded_return = max(-max_bound, min(max_bound, drift))

            # Statistical Volatility Dispersion (1-Sigma = 68% confidence interval)
            sigma_t = daily_volatility * np.sqrt(t_days)

            target_price = round(current_price * (1.0 + bounded_return), 2)
            low_estimate = round(current_price * (1.0 + bounded_return - (1.1 * sigma_t)), 2)
            high_estimate = round(current_price * (1.0 + bounded_return + (1.1 * sigma_t)), 2)
            expected_change_pct = round(bounded_return * 100, 2)

            bias = "BULLISH" if expected_change_pct >= 0.7 else "BEARISH" if expected_change_pct <= -0.7 else "NEUTRAL"

            estimates[h["key"]] = {
                "periodKey": h["key"],
                "label": h["label"],
                "timeframe": h["periodName"],
                "days": t_days,
                "currentPrice": current_price,
                "targetPrice": target_price,
                "lowEstimate": max(0.01, low_estimate),
                "highEstimate": high_estimate,
                "expectedReturnPct": expected_change_pct,
                "directionalBias": bias,
                "volatilityRangePct": round(sigma_t * 100, 2),
                "confidenceInterval": "68% (1-Sigma Empirical Gaussian Model)",
                "impactFactors": [
                    {
                        "driver": "RSI Momentum",
                        "impact": rsi_impact,
                        "sentiment": rsi_sentiment
                    },
                    {
                        "driver": "Moving Average Anchor",
                        "impact": sma_impact,
                        "sentiment": sma_sentiment
                    },
                    {
                        "driver": "Volume Pressure",
                        "impact": vol_impact,
                        "sentiment": vol_sentiment
                    },
                    {
                        "driver": "Systematic Market Trend",
                        "impact": macro_impact,
                        "sentiment": macro_sentiment
                    }
                ]
            }

        return estimates

    @staticmethod
    def _generate_fallback(current_price: float) -> Dict[str, Any]:
        """
        Fallback generator when history length is insufficient.
        """
        return {
            "1day": {
                "periodKey": "1day",
                "label": "1-Day Projection",
                "timeframe": "Next Trading Session",
                "days": 1,
                "currentPrice": current_price,
                "targetPrice": round(current_price * 1.002, 2),
                "lowEstimate": round(current_price * 0.985, 2),
                "highEstimate": round(current_price * 1.018, 2),
                "expectedReturnPct": 0.2,
                "directionalBias": "NEUTRAL",
                "volatilityRangePct": 1.5,
                "confidenceInterval": "Standard Dispersion",
                "impactFactors": []
            },
            "1week": {
                "periodKey": "1week",
                "label": "1-Week Projection",
                "timeframe": "5 Trading Days",
                "days": 5,
                "currentPrice": current_price,
                "targetPrice": round(current_price * 1.008, 2),
                "lowEstimate": round(current_price * 0.965, 2),
                "highEstimate": round(current_price * 1.045, 2),
                "expectedReturnPct": 0.8,
                "directionalBias": "NEUTRAL",
                "volatilityRangePct": 3.5,
                "confidenceInterval": "Standard Dispersion",
                "impactFactors": []
            },
            "1month": {
                "periodKey": "1month",
                "label": "1-Month Projection",
                "timeframe": "21 Trading Days",
                "days": 21,
                "currentPrice": current_price,
                "targetPrice": round(current_price * 1.025, 2),
                "lowEstimate": round(current_price * 0.920, 2),
                "highEstimate": round(current_price * 1.095, 2),
                "expectedReturnPct": 2.5,
                "directionalBias": "BULLISH",
                "volatilityRangePct": 7.5,
                "confidenceInterval": "Standard Dispersion",
                "impactFactors": []
            }
        }
