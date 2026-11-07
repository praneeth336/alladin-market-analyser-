import pandas as pd
import numpy as np
from typing import Dict, Any

class RiskEngine:
    @staticmethod
    def calculate_risk_metrics(df_prices: pd.DataFrame, benchmark_symbol: str = "^NSEI") -> Dict[str, Any]:
        """
        Compute quantitative risk indicators: Volatility, Max Drawdown, Sharpe Ratio, Beta.
        """
        if df_prices.empty or "close" not in df_prices.columns or len(df_prices) < 10:
            return {
                "riskLevel": "UNKNOWN",
                "volatilityPct": 0.0,
                "maxDrawdownPct": 0.0,
                "sharpeRatio": 0.0,
                "beta": 1.0,
                "summary": "Insufficient data for quantitative risk modeling."
            }

        close_prices = df_prices["close"]
        returns = close_prices.pct_change().dropna()

        # Annualized Volatility (std dev of daily returns * sqrt(252 trading days))
        daily_volatility = returns.std()
        annualized_volatility = daily_volatility * np.sqrt(252)
        volatility_pct = round(float(annualized_volatility * 100), 2)

        # Maximum Drawdown (Peak to Trough drop)
        cumulative_max = close_prices.cummax()
        drawdown = (close_prices - cumulative_max) / cumulative_max
        max_drawdown = float(drawdown.min())
        max_drawdown_pct = round(abs(max_drawdown) * 100, 2)

        # Sharpe Ratio (Assuming 6.5% risk-free rate for India / 4.5% for US)
        risk_free_rate = 0.065 if benchmark_symbol == "^NSEI" else 0.045
        annualized_return = (close_prices.iloc[-1] / close_prices.iloc[0]) ** (252 / len(close_prices)) - 1
        excess_return = annualized_return - risk_free_rate
        sharpe_ratio = round(float(excess_return / annualized_volatility) if annualized_volatility > 0 else 0.0, 2)

        # Simplified Beta calculation estimation
        beta = 1.0
        if volatility_pct < 15:
            beta = round(0.7 + (volatility_pct / 100), 2)
        elif volatility_pct < 30:
            beta = round(0.95 + (volatility_pct / 150), 2)
        else:
            beta = round(1.2 + (volatility_pct / 100), 2)

        # Categorize Risk Level
        if volatility_pct < 18 and max_drawdown_pct < 15:
            risk_level = "LOW"
            risk_color = "green"
        elif volatility_pct < 32 and max_drawdown_pct < 28:
            risk_level = "MODERATE"
            risk_color = "yellow"
        else:
            risk_level = "HIGH"
            risk_color = "red"

        return {
            "riskLevel": risk_level,
            "riskColor": risk_color,
            "volatilityPct": volatility_pct,
            "maxDrawdownPct": max_drawdown_pct,
            "sharpeRatio": sharpe_ratio,
            "beta": beta,
            "annualizedReturnPct": round(float(annualized_return * 100), 2),
            "summary": f"Annualized volatility is {volatility_pct}% with a 1-year max drawdown of {max_drawdown_pct}%."
        }
