from typing import Dict, Any, Optional

class FundamentalEngine:
    @staticmethod
    def evaluate_fundamentals(metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate stock fundamentals and produce health ratings and scorecard.
        """
        pe_ratio = metadata.get("peRatio")
        pb_ratio = metadata.get("priceToBook")
        roe = metadata.get("returnOnEquity")
        debt_to_equity = metadata.get("debtToEquity")
        profit_margin = metadata.get("profitMargins")
        div_yield = metadata.get("dividendYield", 0.0)

        # Health Scoring (0-100)
        valuation_score = 50
        solvency_score = 50
        profitability_score = 50

        # Valuation Assessment
        valuation_status = "Fairly Valued"
        if pe_ratio is not None:
            if pe_ratio < 15:
                valuation_score = 85
                valuation_status = "Undervalued / Attractive P/E"
            elif pe_ratio < 30:
                valuation_score = 65
                valuation_status = "Fairly Valued"
            elif pe_ratio < 50:
                valuation_score = 40
                valuation_status = "Elevated Valuation"
            else:
                valuation_score = 20
                valuation_status = "Highly Speculative / High P/E"

        # Solvency Assessment (Debt to Equity)
        solvency_status = "Moderate Debt"
        if debt_to_equity is not None:
            if debt_to_equity < 50:
                solvency_score = 90
                solvency_status = "Low Debt / Strong Balance Sheet"
            elif debt_to_equity < 150:
                solvency_score = 65
                solvency_status = "Manageable Debt"
            else:
                solvency_score = 30
                solvency_status = "High Financial Leverage"

        # Profitability Assessment (ROE & Profit Margin)
        profitability_status = "Moderate Profitability"
        if roe is not None:
            if roe > 20:
                profitability_score = 90
                profitability_status = "High Capital Efficiency (ROE > 20%)"
            elif roe > 10:
                profitability_score = 70
                profitability_status = "Healthy ROE (> 10%)"
            else:
                profitability_score = 40
                profitability_status = "Low ROE (< 10%)"

        overall_fundamental_score = round((valuation_score + solvency_score + profitability_score) / 3)

        return {
            "overallScore": overall_fundamental_score,
            "valuationScore": valuation_score,
            "valuationStatus": valuation_status,
            "solvencyScore": solvency_score,
            "solvencyStatus": solvency_status,
            "profitabilityScore": profitability_score,
            "profitabilityStatus": profitability_status,
            "ratios": {
                "peRatio": pe_ratio,
                "priceToBook": pb_ratio,
                "returnOnEquity": f"{roe}%" if roe is not None else "N/A",
                "debtToEquity": debt_to_equity,
                "profitMargin": f"{profit_margin}%" if profit_margin is not None else "N/A",
                "dividendYield": f"{div_yield}%" if div_yield else "0.0%"
            }
        }
