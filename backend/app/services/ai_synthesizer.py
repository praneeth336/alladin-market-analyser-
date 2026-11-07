import httpx
import json
from typing import Dict, Any, Optional
from app.config import settings

class AISynthesizer:
    @staticmethod
    async def generate_research_report(
        metadata: Dict[str, Any],
        fundamentals: Dict[str, Any],
        technicals: Dict[str, Any],
        risk: Dict[str, Any],
        estimates: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Synthesize quantitative data and price projections into a structured SEBI-compliant research digest.
        """
        symbol = metadata.get("symbol", "")
        name = metadata.get("shortName", symbol)
        currency = metadata.get("currency", "INR")
        price = metadata.get("currentPrice", 0.0)

        # 1. Deterministic Fallback Synthesis (Guaranteed to work standalone)
        report = AISynthesizer._generate_fallback_report(symbol, name, currency, price, metadata, fundamentals, technicals, risk, estimates)

        # 2. If Gemini API Key is configured, attempt external synthesis upgrade
        if settings.AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
            try:
                gemini_report = await AISynthesizer._call_gemini_api(symbol, name, metadata, fundamentals, technicals, risk, estimates)
                if gemini_report:
                    report["executiveSummary"] = gemini_report.get("executiveSummary", report["executiveSummary"])
                    report["keyDrivers"] = gemini_report.get("keyDrivers", report["keyDrivers"])
                    report["riskAssessment"] = gemini_report.get("riskAssessment", report["riskAssessment"])
            except Exception:
                pass

        return report

    @staticmethod
    def _generate_fallback_report(
        symbol: str,
        name: str,
        currency: str,
        price: float,
        metadata: Dict[str, Any],
        fundamentals: Dict[str, Any],
        technicals: Dict[str, Any],
        risk: Dict[str, Any],
        estimates: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Rule-based deterministic financial report synthesizer.
        """
        pe = fundamentals["ratios"].get("peRatio")
        roe = fundamentals["ratios"].get("returnOnEquity")
        debt = fundamentals["ratios"].get("debtToEquity")
        val_status = fundamentals.get("valuationStatus", "N/A")
        tech_signal = technicals.get("overallSignal", "NEUTRAL")
        rsi = technicals.get("rsi", 50.0)
        vol = risk.get("volatilityPct", 0.0)
        drawdown = risk.get("maxDrawdownPct", 0.0)
        sharpe = risk.get("sharpeRatio", 0.0)

        est_1d = estimates.get("1day", {}) if estimates else {}
        est_1w = estimates.get("1week", {}) if estimates else {}
        est_1m = estimates.get("1month", {}) if estimates else {}

        curr_sym = "INR " if currency == "INR" else "$"

        exec_summary = (
            f"{name} ({symbol}) is actively quoting at {currency} {price}. "
            f"Fundamental analysis indicates an overall scorecard of {fundamentals.get('overallScore', 50)}/100 ({val_status}). "
            f"Technical momentum indicators reflect a {tech_signal} configuration with RSI at {rsi}. "
            f"Based on real-time volatility ({vol}%) and momentum drift, statistical estimations project a 1-day expected target of {curr_sym}{est_1d.get('targetPrice', price)} "
            f"({est_1d.get('directionalBias', 'NEUTRAL')}), 1-week target of {curr_sym}{est_1w.get('targetPrice', price)}, "
            f"and 1-month horizon at {curr_sym}{est_1m.get('targetPrice', price)}."
        )

        key_drivers = [
            f"Multi-Horizon Projections: 1-Day: {curr_sym}{est_1d.get('targetPrice', price)} ({est_1d.get('expectedReturnPct', 0)}%), 1-Week: {curr_sym}{est_1w.get('targetPrice', price)} ({est_1w.get('expectedReturnPct', 0)}%), 1-Month: {curr_sym}{est_1m.get('targetPrice', price)} ({est_1m.get('expectedReturnPct', 0)}%).",
            f"Valuation & Capital Efficiency: P/E is {pe or 'N/A'}, Debt-to-Equity is {debt or 'N/A'} ({fundamentals.get('solvencyStatus')}), and ROE is {roe or 'N/A'}.",
            f"Technical & Momentum Drivers: RSI-14 is {rsi} ({technicals.get('rsiStatus')}); 50-day SMA is {technicals.get('sma50')} with MACD status: {technicals.get('macdStatus')}.",
            f"Quantitative Risk Profile: Annualized volatility is {vol}% with trailing 1-year max drawdown of {drawdown}% and Beta of {risk.get('beta', 1.0)}."
        ]

        risk_assessment = (
            f"Key risk considerations for {name} ({symbol}) include peak-to-trough historical drawdown exposure of {drawdown}% "
            f"and statistical dispersion across time horizons (1-month volatility band is ±{est_1m.get('volatilityRangePct', vol)}%). "
            f"Investors should monitor financial leverage ({debt or 'N/A'} D/E) and market-wide beta transmission."
        )

        sebi_disclaimer = (
            "REGULATORY & SEBI DISCLAIMER: Alladin is an educational quantitative research and simulation engine. "
            "Multi-horizon price estimations and models represent statistical projections derived from empirical gaussian distributions "
            "and historical momentum factors. They do NOT constitute guaranteed returns, buy/sell recommendations, or personalized financial advice. "
            "Consult a certified SEBI registered investment advisor before executing trades."
        )

        audit_citations = [
            f"Live Data Source: Real-time public exchange telemetry.",
            f"Price Estimates: 1-Day ({curr_sym}{est_1d.get('targetPrice')}), 1-Week ({curr_sym}{est_1w.get('targetPrice')}), 1-Month ({curr_sym}{est_1m.get('targetPrice')}).",
            f"Valuation Audit: P/E ({pe}), P/B ({fundamentals['ratios'].get('priceToBook')}), D/E ({debt}).",
            f"Technical Audit: RSI-14 ({rsi}), SMA-50 ({technicals.get('sma50')}), SMA-200 ({technicals.get('sma200')}).",
            f"Risk Audit: Annualized Volatility ({vol}%), Max Drawdown ({drawdown}%), Sharpe ({sharpe})."
        ]

        return {
            "symbol": symbol,
            "companyName": name,
            "executiveSummary": exec_summary,
            "keyDrivers": key_drivers,
            "riskAssessment": risk_assessment,
            "sebiDisclaimer": sebi_disclaimer,
            "auditCitations": audit_citations,
            "estimates": estimates,
            "generatedAt": "Real-Time Telemetry"
        }

    @staticmethod
    async def _call_gemini_api(symbol: str, name: str, metadata: Dict, fundamentals: Dict, technicals: Dict, risk: Dict, estimates: Optional[Dict]) -> Optional[Dict]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        prompt = f"""
You are a senior quantitative equity analyst. Synthesize the following financial telemetry and price estimates for {name} ({symbol}):
- Fundamentals: {json.dumps(fundamentals)}
- Technicals: {json.dumps(technicals)}
- Risk: {json.dumps(risk)}
- Price Estimates (1d, 1w, 1m): {json.dumps(estimates)}

Return ONLY valid JSON matching this schema:
{{
  "executiveSummary": "2-3 concise sentences summarizing health, technicals, and 1d/1w/1m price targets.",
  "keyDrivers": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"],
  "riskAssessment": "Concise risk analysis"
}}
"""
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                clean_json = text.replace("```json", "").replace("```", "").strip()
                return json.loads(clean_json)
        return None
