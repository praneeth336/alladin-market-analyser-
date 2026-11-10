# Alladin — AI-Powered Stock Research & Market Intelligence Platform

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![SEBI Compliant](https://img.shields.io/badge/SEBI-Audit_Compliant-10b981?style=for-the-badge&logo=shield&logoColor=white)

**Alladin** is an institutional-grade, full-stack quantitative equity research and market telemetry platform inspired by BlackRock's Aladdin. Built with **FastAPI**, **React 18**, **Tailwind CSS**, and **Recharts**, Alladin combines real-time exchange telemetry, deterministic financial fundamental modeling, multi-horizon price estimations (1-Day, 1-Week, 1-Month), quantitative risk analytics, and live market situation news feeds for **all 50+ NIFTY 50 constituent companies** and global equities.

---

## 🏛️ System Architecture

```
                                  ┌─────────────────────────────┐
                                  │   Real-Time Exchange Data   │
                                  │  (Yahoo Telemetry / Google) │
                                  └──────────────┬──────────────┘
                                                 │
                                                 ▼
               ┌─────────────────────────────────────────────────────────────────┐
               │                     FastAPI Analytics Core                      │
               │                                                                 │
               │  ┌─────────────────────────┐       ┌─────────────────────────┐  │
               │  │  Technical & Momentum   │       │  Fundamental Analytics  │  │
               │  │  (RSI, MACD, SMA 20/50) │       │  (P/E, ROE, D/E, Margins)│  │
               │  └────────────┬────────────┘       └────────────┬────────────┘  │
               │               │                                 │               │
               │               ▼                                 ▼               │
               │  ┌───────────────────────────────────────────────────────────┐  │
               │  │   Multi-Horizon Price Estimation Engine (1d / 1w / 1m)    │  │
               │  │   (Momentum Drift, Volume Pressure, Gaussian 1-σ Bounds)  │  │
               │  └────────────────────────────┬──────────────────────────────┘  │
               │                               │                                 │
               │  ┌─────────────────────────┐  │    ┌─────────────────────────┐  │
               │  │   Live News Intelligence│  │    │  Quantitative Risk Core │  │
               │  │   (Sentiment & Impact)  │  │    │  (Sharpe, Max Drawdown) │  │
               │  └────────────┬────────────┘  │    └────────────┬────────────┘  │
               └───────────────┼───────────────┼─────────────────┼───────────────┘
                               │               │                 │
                               ▼               ▼                 ▼
               ┌─────────────────────────────────────────────────────────────────┐
               │             Unified Single-Server Frontend (React 18)           │
               │                                                                 │
               │  • Interactive OHLC Chart with Open, Close & Day High Tooltip   │
               │  • Real-Time Monitoring Bar with 4s Telemetry Tick Flash        │
               │  • Multi-Horizon Target Cards (1-Day, 1-Week, 1-Month)          │
               │  • Breaking Market Situation & News Impact Feed                 │
               │  • Interactive NIFTY 50 Constituent Explorer (9 Sectors)        │
               │  • Grounded SEBI-Compliant AI Research Synthesis Digest         │
               └─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features & Capabilities

### 1. 🇮🇳 Complete NIFTY 50 Index Integration (All 50+ Companies)
* Complete constituent coverage across all 9 core sectors:
  * **Banking & Financial Services (10):** `HDFCBANK.NS`, `ICICIBANK.NS`, `SBIN.NS`, `KOTAKBANK.NS`, `AXISBANK.NS`, `BAJFINANCE.NS`, `BAJAJFINSV.NS`, `SHRIRAMFIN.NS`, `HDFCLIFE.NS`, `SBILIFE.NS`
  * **Information Technology (6):** `TCS.NS`, `INFY.NS`, `HCLTECH.NS`, `WIPRO.NS`, `TECHM.NS`, `LTIM.NS`
  * **Oil, Gas & Energy (5):** `RELIANCE.NS`, `ONGC.NS`, `BPCL.NS`, `COALINDIA.NS`, `NTPC.NS`
  * **Automotive & EV (6):** `TATAMOTORS.NS`, `MARUTI.NS`, `M&M.NS`, `BAJAJ-AUTO.NS`, `EICHERMOT.NS`, `HEROMOTOCO.NS`
  * **Consumer Goods / FMCG (5):** `ITC.NS`, `HINDUNILVR.NS`, `NESTLEIND.NS`, `BRITANNIA.NS`, `TATACONSUM.NS`
  * **Pharmaceuticals & Healthcare (5):** `SUNPHARMA.NS`, `CIPLA.NS`, `DRREDDY.NS`, `DIVISLAB.NS`, `APOLLOHOSP.NS`
  * **Metals & Materials (6):** `TATASTEEL.NS`, `JSWSTEEL.NS`, `HINDALCO.NS`, `ADANIENT.NS`, `ULTRACEMCO.NS`, `GRASIM.NS`
  * **Infrastructure & Engineering (4):** `LT.NS`, `POWERGRID.NS`, `ADANIPORTS.NS`, `BEL.NS`
  * **Telecom & Consumer Retail (4):** `BHARTIARTL.NS`, `TITAN.NS`, `TRENT.NS`, `ASIANPAINT.NS`
* **Nifty 50 Explorer Component:** Filter companies by sector, review official index weighting percentages, and inspect corporate fundamentals with one-click switching.
* **Smart Search Autocomplete:** Instant search matching by symbol, corporate name, group (e.g., *Tata*, *Adani*, *Bajaj*), or sector.

### 2. 🎯 Multi-Horizon Price Estimation Engine (1-Day, 1-Week, 1-Month)
* **Statistical Drift Modeling:** Computes expected price projections calibrated against:
  * **RSI Momentum:** Identifies oversold rebound lift or overbought exhaustion resistance.
  * **Moving Average Anchor:** Evaluates mean-reversion pull relative to the 50-day and 200-day SMAs.
  * **Institutional Volume Pressure:** Measures surge velocity against the 20-day baseline average.
  * **Systematic Market Beta:** Integrates macro index correlation ($\beta \times R_{\text{Nifty}}$).
* **Statistical Range Bands (1-Sigma):** Provides empirical Gaussian confidence intervals displaying the **Support Floor (Low Estimate)** and **Resistance Ceiling (High Estimate)** representing 68% statistical probability.

### 3. ⚡ Continuous Real-Time Telemetry & Monitoring
* **Live Telemetry Stream:** Automatically polls live quotes at 4-second intervals.
* **Tick Direction Visual Feedback:** Instant flash animations (emerald green on uptick, rose red on downtick).
* **Market Session Awareness:** Automatically tracks exchange hours (`SESSION: OPEN` or `SESSION: POST-MARKET`).
* **Interactive Controls:** Toggle pause/resume or force instant telemetry sync.

### 4. 📰 Live Situation News & Market Impact Feed
* Ingests breaking market news for the selected stock from verified publishers (*Reuters, Bloomberg, The Economic Times, Mint, CNBC*).
* **Automated Sentiment Classification:** Tags articles as **BULLISH**, **BEARISH**, or **NEUTRAL**.
* **Impact Rating Badges:** Highlights **HIGH IMPACT** catalysts (earnings releases, RBI/Fed interest rate decisions, regulatory policies, executive restructuring).
* **"Why It Matters" Situational Notes:** Explains the structural market effect on asset valuation and near-term volatility.

### 5. 📈 Interactive Technical OHLC Charting
* Interactive candlestick and line representations built with Recharts.
* **Point-and-Hover Daily Tooltip:** Displays **Close Price**, **Open Price**, and **Max Price (Day High)** for any date.
* **Overlay Toggles:** Instant toggles for 20-day, 50-day, and 200-day Simple Moving Averages (SMA) and the 14-period RSI Oscillator.

### 6. 🛡️ Quantitative Risk & Financial Health Scorecards
* **Fundamental Scorecard (0–100):** Solvency and valuation health rating based on P/E, P/B, Debt-to-Equity, ROE, Profit Margin, and Dividend Yield.
* **Quantitative Risk Profile:** Evaluates 252-day Annualized Volatility, 1-Year Maximum Drawdown (peak-to-trough drop), Sharpe Ratio, and Beta relative to the benchmark index.

### 7. 📄 SEBI-Compliant AI Research Synthesis
* Generates structured equity research digests with executive summaries, fundamental pillars, sector risk factors, grounded metric citations, and regulatory disclaimers.

---

## 📂 Project Directory Structure

```
alladin-market-analyzer/
├── backend/
│   ├── app/
│   │   ├── data/
│   │   │   └── nifty50.py              # Full Nifty 50 constituent registry & metadata
│   │   ├── routers/
│   │   │   └── stock.py                # FastAPI routes (stock overview, live quote, news, estimates)
│   │   ├── services/
│   │   │   ├── ai_synthesizer.py       # Grounded research report generator with SEBI guardrails
│   │   │   ├── data_fetcher.py         # High-speed Yahoo Finance telemetry client with caching
│   │   │   ├── estimation_engine.py    # Multi-horizon Gaussian price estimation engine
│   │   │   ├── fundamental.py          # Deterministic financial ratio scorecard calculator
│   │   │   ├── news_engine.py          # Real-time situation news feed & sentiment classifier
│   │   │   ├── risk_engine.py          # Sharpe ratio, Max Drawdown, Beta & Volatility engine
│   │   │   └── technical.py            # Moving averages (SMA 20/50/200), RSI, MACD calculator
│   │   ├── config.py                   # Application settings & environment configuration
│   │   └── main.py                     # FastAPI application setup & static frontend mount
│   ├── requirements.txt                # Python backend dependencies
│   └── run.py                          # Uvicorn backend runner
├── frontend/
│   ├── dist/                           # Compiled production frontend build
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIReport.jsx            # Research digest with audit citations
│   │   │   ├── Header.jsx              # Navbar with search autocomplete & index tickers
│   │   │   ├── MetricCard.jsx          # Health, Valuation, Profitability & Risk scorecards
│   │   │   ├── NewsColumn.jsx          # Live situation news & sentiment stream
│   │   │   ├── Nifty50Explorer.jsx     # Interactive 9-sector constituent explorer
│   │   │   ├── PriceEstimates.jsx      # Multi-horizon target cards (1d, 1w, 1m)
│   │   │   └── StockChart.jsx          # Interactive chart with Open, Close & Max price tooltip
│   │   ├── App.jsx                     # Master dashboard container coordinating state & live polling
│   │   ├── index.css                   # Tailwind CSS directives & custom styling
│   │   └── main.jsx                    # React 18 DOM entry point
│   ├── index.html                      # HTML5 template
│   ├── package.json                    # Frontend package dependencies & scripts
│   ├── tailwind.config.js              # Tailwind styling configuration
│   └── vite.config.js                  # Vite build tool and dev server configuration
├── .gitignore                          # Git ignore rules
└── README.md                           # Comprehensive documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Python:** 3.10 or higher
* **Node.js:** 18.0 or higher *(optional, only needed if rebuilding the frontend)*

### 1. Clone the Repository
```bash
git clone https://github.com/praneeth336/alladin-market-analyzer.git
cd alladin-market-analyzer
```

### 2. Set Up the Backend
```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On Linux / macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Launch the Application (Single-Server Mode)
The FastAPI server serves both the backend API and the compiled React frontend directly from `http://localhost:8000`:
```bash
python run.py
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

---

## 🛠️ Frontend Development (Optional)
If you wish to modify the React components and rebuild the frontend:
```bash
cd frontend
npm install
npm run dev     # Run Vite development server on port 5173
npm run build   # Compile production bundle to frontend/dist
```

---

## 📡 API Reference Overview

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/stock/{symbol}` | `GET` | Comprehensive stock package (Metadata, Fundamentals, Technicals, Risk, Estimates & News). |
| `/api/stock/{symbol}/live` | `GET` | Lightweight, sub-second telemetry endpoint for live price, day high/low, and market status. |
| `/api/stock/{symbol}/history` | `GET` | Historical OHLCV bars with calculated SMA 20/50/200 and RSI series. |
| `/api/stock/{symbol}/estimates` | `GET` | Multi-horizon price estimations (1-Day, 1-Week, 1-Month) with 1-sigma bounds and impact factors. |
| `/api/stock/{symbol}/news` | `GET` | Real-time news situation feed with sentiment analysis and market impact ratings. |
| `/api/stock/{symbol}/analysis` | `GET` | Grounded SEBI-compliant AI research digest. |
| `/api/nifty50` | `GET` | Complete list of all 50+ Nifty 50 companies grouped across 9 sectors. |
| `/api/search?q={query}` | `GET` | Search autocomplete by ticker, company name, group, or sector. |
| `/api/market/overview` | `GET` | Benchmark index telemetry for Nifty 50 (`^NSEI`) and S&P 500 (`^GSPC`). |
| `/docs` | `GET` | Interactive Swagger API documentation. |

---

## ⚖️ Regulatory & Compliance Disclaimer

> **IMPORTANT NOTICE:**
> Alladin is an educational financial modeling, telemetry analysis, and quantitative research simulation engine. All multi-horizon price estimations, statistical bands, and technical indicators are computed using empirical Gaussian distributions and historical price action.
> 
> **Nothing on this platform constitutes personalized investment advice, financial recommendations, or guaranteed return promises under SEBI (Securities and Exchange Board of India) regulations or global financial authorities.**
> 
> Users should independently verify all data and consult a SEBI-registered investment advisor before executing trades.
