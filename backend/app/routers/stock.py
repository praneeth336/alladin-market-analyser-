from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List
from app.services.data_fetcher import DataFetcher
from app.services.fundamental import FundamentalEngine
from app.services.technical import TechnicalEngine
from app.services.risk_engine import RiskEngine
from app.services.estimation_engine import PriceEstimationEngine
from app.services.ai_synthesizer import AISynthesizer
from app.services.news_engine import NewsEngine
from app.data.nifty50 import NIFTY_50_COMPANIES, US_POPULAR_COMPANIES, ALL_COMPANIES_MAP

router = APIRouter(prefix="/api", tags=["Stock Analytics"])

POPULAR_STOCKS = NIFTY_50_COMPANIES + US_POPULAR_COMPANIES

@router.get("/nifty50")
async def get_nifty50_companies(sector: str = Query("", min_length=0)) -> Dict[str, Any]:
    """
    Fetch all constituent companies of the Nifty 50 Index grouped by sector.
    """
    companies = NIFTY_50_COMPANIES
    if sector.strip():
        sec = sector.strip().lower()
        companies = [c for c in companies if sec in c["sector"].lower()]
    
    sectors = sorted(list(set(c["sector"] for c in NIFTY_50_COMPANIES)))
    return {
        "index": "NIFTY 50",
        "total": len(companies),
        "sectors": sectors,
        "companies": companies
    }

@router.get("/stock/{symbol}")
async def get_stock_overview(symbol: str, period: str = "1y") -> Dict[str, Any]:
    """
    Fetch comprehensive analytics (Metadata, Fundamentals, Technicals, Quantitative Risk, Price Estimates & Live News).
    """
    try:
        data = DataFetcher.get_stock_data(symbol, period=period)
        metadata = data["metadata"]
        df_prices = data["df_prices"]
        current_price = metadata["currentPrice"]

        benchmark_symbol = "^NSEI" if symbol.endswith(".NS") or symbol.endswith(".BO") else "^GSPC"

        fundamentals = FundamentalEngine.evaluate_fundamentals(metadata)
        technicals = TechnicalEngine.calculate_indicators(df_prices)
        risk = RiskEngine.calculate_risk_metrics(df_prices, benchmark_symbol=benchmark_symbol)

        # Multi-Horizon Price Estimation Engine (1-Day, 1-Week, 1-Month)
        estimates = PriceEstimationEngine.calculate_estimates(
            current_price=current_price,
            df_prices=df_prices,
            technicals=technicals,
            risk=risk,
            fundamentals=fundamentals,
            beta=risk.get("beta", 1.0)
        )

        # Fetch real-time market situation news
        news = NewsEngine.get_stock_news(symbol, company_name=metadata.get("shortName", symbol))

        return {
            "symbol": metadata["symbol"],
            "metadata": metadata,
            "fundamentals": fundamentals,
            "technicals": {
                "overallSignal": technicals["overallSignal"],
                "rsi": technicals["rsi"],
                "rsiStatus": technicals["rsiStatus"],
                "sma20": technicals["sma20"],
                "sma50": technicals["sma50"],
                "sma200": technicals["sma200"],
                "macd": technicals["macd"],
                "macdStatus": technicals["macdStatus"]
            },
            "risk": risk,
            "priceEstimates": estimates,
            "news": news
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/stock/{symbol}/live")
async def get_stock_live(symbol: str) -> Dict[str, Any]:
    """
    Real-time live telemetry endpoint for continuous monitoring updates (polled at 3s-5s intervals).
    """
    try:
        return DataFetcher.get_live_quote(symbol)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/stock/{symbol}/news")
async def get_stock_news_feed(symbol: str) -> List[Dict[str, Any]]:
    """
    Dedicated endpoint for real-time market news and situation impact feed.
    """
    try:
        data = DataFetcher.get_stock_data(symbol, period="5d")
        company_name = data.get("metadata", {}).get("shortName", symbol)
        return NewsEngine.get_stock_news(symbol, company_name=company_name)
    except Exception:
        return NewsEngine.get_stock_news(symbol, company_name=symbol)

@router.get("/stock/{symbol}/history")
async def get_stock_history(symbol: str, period: str = "1y", interval: str = "1d") -> Dict[str, Any]:
    """
    Fetch historical OHLCV chart bars and indicator series for plotting.
    """
    try:
        data = DataFetcher.get_stock_data(symbol, period=period, interval=interval)
        df_prices = data["df_prices"]
        technicals = TechnicalEngine.calculate_indicators(df_prices)

        return {
            "symbol": symbol.upper(),
            "history": data["history"],
            "chartSeries": technicals.get("chartSeries", [])
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/stock/{symbol}/estimates")
async def get_stock_estimates(symbol: str, period: str = "1y") -> Dict[str, Any]:
    """
    Dedicated endpoint for 1-Day, 1-Week, and 1-Month real-time price estimations and impact factors.
    """
    try:
        data = DataFetcher.get_stock_data(symbol, period=period)
        metadata = data["metadata"]
        df_prices = data["df_prices"]
        current_price = metadata["currentPrice"]

        benchmark_symbol = "^NSEI" if symbol.endswith(".NS") or symbol.endswith(".BO") else "^GSPC"
        fundamentals = FundamentalEngine.evaluate_fundamentals(metadata)
        technicals = TechnicalEngine.calculate_indicators(df_prices)
        risk = RiskEngine.calculate_risk_metrics(df_prices, benchmark_symbol=benchmark_symbol)

        estimates = PriceEstimationEngine.calculate_estimates(
            current_price=current_price,
            df_prices=df_prices,
            technicals=technicals,
            risk=risk,
            fundamentals=fundamentals,
            beta=risk.get("beta", 1.0)
        )
        return {"symbol": symbol.upper(), "currentPrice": current_price, "estimates": estimates}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/stock/{symbol}/analysis")
async def get_stock_analysis(symbol: str, period: str = "1y") -> Dict[str, Any]:
    """
    Generate SEBI-compliant AI stock research digest incorporating price estimates.
    """
    try:
        data = DataFetcher.get_stock_data(symbol, period=period)
        metadata = data["metadata"]
        df_prices = data["df_prices"]
        current_price = metadata["currentPrice"]

        benchmark_symbol = "^NSEI" if symbol.endswith(".NS") else "^GSPC"
        fundamentals = FundamentalEngine.evaluate_fundamentals(metadata)
        technicals = TechnicalEngine.calculate_indicators(df_prices)
        risk = RiskEngine.calculate_risk_metrics(df_prices, benchmark_symbol=benchmark_symbol)

        estimates = PriceEstimationEngine.calculate_estimates(
            current_price=current_price,
            df_prices=df_prices,
            technicals=technicals,
            risk=risk,
            fundamentals=fundamentals,
            beta=risk.get("beta", 1.0)
        )

        report = await AISynthesizer.generate_research_report(
            metadata, fundamentals, technicals, risk, estimates=estimates
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/search")
async def search_tickers(q: str = Query("", min_length=0)) -> List[Dict[str, Any]]:
    """
    Search stock tickers by symbol, company name, short name, or sector across all Nifty 50 and global stocks.
    """
    query = q.strip().upper()
    if not query:
        return POPULAR_STOCKS

    matches = [
        item for item in POPULAR_STOCKS
        if query in item["symbol"].upper()
        or query in item["name"].upper()
        or query in item.get("shortName", "").upper()
        or query in item["sector"].upper()
    ]

    # If no popular list match, add exact query as fallback
    if not matches:
        country = "India" if query.endswith(".NS") or query.endswith(".BO") else "US"
        matches.append({"symbol": query, "name": f"Ticker ({query})", "shortName": query, "country": country, "sector": "Market Security"})

    return matches

@router.get("/market/overview")
async def get_market_overview() -> Dict[str, Any]:
    """
    Fetch market benchmark index statuses (Nifty 50 and S&P 500).
    """
    indices = {"NIFTY50": "^NSEI", "SP500": "^GSPC"}
    result = {}

    for name, sym in indices.items():
        try:
            data = DataFetcher.get_stock_data(sym, period="5d")
            meta = data["metadata"]
            result[name] = {
                "symbol": sym,
                "name": "Nifty 50" if name == "NIFTY50" else "S&P 500",
                "price": meta["currentPrice"],
                "change": meta["priceChange"],
                "changePct": meta["priceChangePct"]
            }
        except Exception:
            result[name] = {"symbol": sym, "name": name, "price": 0.0, "change": 0.0, "changePct": 0.0}

    return result
