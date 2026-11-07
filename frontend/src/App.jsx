import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import MetricCard from './components/MetricCard';
import PriceEstimates from './components/PriceEstimates';
import StockChart from './components/StockChart';
import NewsColumn from './components/NewsColumn';
import Nifty50Explorer from './components/Nifty50Explorer';
import AIReport from './components/AIReport';
import { RefreshCw, Shield, Radio, Pause, Play, Clock, Activity, Zap } from 'lucide-react';
import axios from 'axios';

export default function App() {
  const [activeSymbol, setActiveSymbol] = useState('TCS.NS');
  const [period, setPeriod] = useState('1y');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stockOverview, setStockOverview] = useState(null);
  const [stockHistory, setStockHistory] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [marketOverview, setMarketOverview] = useState(null);

  // Real-time live monitoring states
  const [liveMonitoring, setLiveMonitoring] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState('Just now');
  const [priceFlash, setPriceFlash] = useState(null); // 'green' | 'red' | null
  const [marketSessionStatus, setMarketSessionStatus] = useState('OPEN');
  const [newsLoading, setNewsLoading] = useState(false);
  const prevPriceRef = useRef(null);

  // Fetch market overview indices on load
  useEffect(() => {
    axios.get('/api/market/overview')
      .then(res => setMarketOverview(res.data))
      .catch(() => {});
  }, []);

  // Fetch full stock overview, history, and AI research report whenever ticker or period changes
  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      axios.get(`/api/stock/${activeSymbol}?period=${period}`),
      axios.get(`/api/stock/${activeSymbol}/history?period=${period}`),
      axios.get(`/api/stock/${activeSymbol}/analysis?period=${period}`)
    ])
      .then(([overviewRes, historyRes, reportRes]) => {
        setStockOverview(overviewRes.data);
        setStockHistory(historyRes.data);
        setAiReport(reportRes.data);
        prevPriceRef.current = overviewRes.data?.metadata?.currentPrice;
        setLastSyncTime(new Date().toLocaleTimeString());
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.detail || `Failed to fetch stock research data for '${activeSymbol}'.`);
        setLoading(false);
      });
  }, [activeSymbol, period]);

  // Real-time continuous live polling for price & market session updates
  useEffect(() => {
    if (!liveMonitoring || loading) return;

    const interval = setInterval(() => {
      axios.get(`/api/stock/${activeSymbol}/live`)
        .then(res => {
          const liveData = res.data;
          if (!liveData || !liveData.currentPrice) return;

          const oldPrice = prevPriceRef.current;
          const newPrice = liveData.currentPrice;

          // Detect price tick direction for visual feedback
          if (oldPrice && newPrice > oldPrice) {
            setPriceFlash('green');
            setTimeout(() => setPriceFlash(null), 1000);
          } else if (oldPrice && newPrice < oldPrice) {
            setPriceFlash('red');
            setTimeout(() => setPriceFlash(null), 1000);
          }

          prevPriceRef.current = newPrice;
          setMarketSessionStatus(liveData.marketStatus || 'OPEN');
          setLastSyncTime(liveData.serverTime || new Date().toLocaleTimeString());

          // Seamlessly update metadata without resetting other state
          setStockOverview(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              metadata: {
                ...prev.metadata,
                currentPrice: liveData.currentPrice,
                priceChange: liveData.priceChange,
                priceChangePct: liveData.priceChangePct,
                dayHigh: liveData.dayHigh || prev.metadata.dayHigh,
                dayLow: liveData.dayLow || prev.metadata.dayLow
              }
            };
          });
        })
        .catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, [liveMonitoring, activeSymbol, loading]);

  // Handler to refresh news column manually
  const handleRefreshNews = () => {
    setNewsLoading(true);
    axios.get(`/api/stock/${activeSymbol}/news`)
      .then(res => {
        setStockOverview(prev => prev ? { ...prev, news: res.data } : prev);
        setNewsLoading(false);
      })
      .catch(() => setNewsLoading(false));
  };

  const meta = stockOverview?.metadata || {};
  const isIndia = activeSymbol.endsWith('.NS') || activeSymbol.endsWith('.BO');
  const currencySymbol = meta.currency === 'INR' || isIndia ? '₹' : '$';

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      
      {/* Top Header */}
      <Header
        activeSymbol={activeSymbol}
        onSelectSymbol={(sym) => setActiveSymbol(sym)}
        marketOverview={marketOverview}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        
        {/* Watchlist & Live Monitoring Control Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-6 bg-[#111827] p-3 rounded-xl border border-gray-800">
          
          {/* Watchlist Ticker Pills */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none w-full md:w-auto">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Top Leaders:</span>
            {['HDFCBANK.NS', 'RELIANCE.NS', 'ICICIBANK.NS', 'TCS.NS', 'INFY.NS', 'BHARTIARTL.NS', 'SBIN.NS', 'ITC.NS', 'LT.NS', 'TATAMOTORS.NS', 'SUNPHARMA.NS', 'AAPL', 'NVDA'].map(sym => (
              <button
                key={sym}
                onClick={() => setActiveSymbol(sym)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeSymbol === sym
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>

          {/* Real-Time Live Monitoring Telemetry Status */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-gray-800 text-xs">
            
            {/* Live Indicator Radar */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {liveMonitoring && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${liveMonitoring ? 'bg-emerald-500' : 'bg-gray-600'}`}></span>
              </span>
              <span className={`font-semibold ${liveMonitoring ? 'text-emerald-400' : 'text-gray-400'}`}>
                {liveMonitoring ? 'LIVE MONITOR (4s)' : 'PAUSED'}
              </span>
            </div>

            {/* Market Session Tag */}
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
              marketSessionStatus === 'OPEN'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {marketSessionStatus === 'OPEN' ? 'SESSION: OPEN' : 'SESSION: POST-MARKET'}
            </span>

            {/* Toggle Pause / Resume Monitoring */}
            <button
              onClick={() => setLiveMonitoring(!liveMonitoring)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 transition-colors"
            >
              {liveMonitoring ? (
                <>
                  <Pause className="w-3 h-3 text-amber-400" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-emerald-400" /> Resume
                </>
              )}
            </button>

            {/* Last Synced Clock */}
            <div className="hidden sm:flex items-center gap-1 text-gray-400 text-[11px]">
              <Clock className="w-3 h-3 text-gray-500" />
              <span>{lastSyncTime}</span>
            </div>

          </div>
        </div>

        {/* NIFTY 50 Index Constituents Sector Explorer */}
        <Nifty50Explorer
          activeSymbol={activeSymbol}
          onSelectSymbol={(sym) => setActiveSymbol(sym)}
        />

        {/* Error Notification */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-400 text-sm mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setActiveSymbol('TCS.NS')} className="underline font-semibold text-xs">Switch to TCS.NS</button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-24 bg-gray-900 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="h-32 bg-gray-900 rounded-xl"></div>
              <div className="h-32 bg-gray-900 rounded-xl"></div>
              <div className="h-32 bg-gray-900 rounded-xl"></div>
              <div className="h-32 bg-gray-900 rounded-xl"></div>
            </div>
            <div className="h-64 bg-gray-900 rounded-xl"></div>
            <div className="h-96 bg-gray-900 rounded-xl"></div>
          </div>
        ) : stockOverview ? (
          <div>
            
            {/* Ticker Hero Info Card with Flash Effect */}
            <div className={`bg-[#111827] border rounded-xl p-6 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300 ${
              priceFlash === 'green'
                ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                : priceFlash === 'red'
                ? 'border-rose-500 shadow-lg shadow-rose-500/10 ring-1 ring-rose-500/30'
                : 'border-gray-800'
            }`}>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-extrabold text-white tracking-tight">{meta.shortName || meta.symbol}</h1>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-gray-800 text-blue-400 border border-gray-700">
                    {meta.symbol}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-800/80 text-gray-400">
                    {meta.country} • {meta.sector}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2 max-w-2xl line-clamp-2">{meta.summary}</p>
              </div>

              {/* Price & Change Display with Live Pulse Feedback */}
              <div className="text-left md:text-right shrink-0">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-start md:justify-end gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Live Market Price
                </div>
                <div className={`text-3xl font-extrabold tracking-tight mt-1 transition-colors duration-300 ${
                  priceFlash === 'green' ? 'text-emerald-400' : priceFlash === 'red' ? 'text-rose-400' : 'text-white'
                }`}>
                  {currencySymbol}{meta.currentPrice ? meta.currentPrice.toLocaleString() : '0.00'}
                </div>
                <div className={`text-sm font-semibold mt-1 flex items-center justify-start md:justify-end gap-1 ${
                  meta.priceChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {meta.priceChange >= 0 ? '+' : ''}{currencySymbol}{meta.priceChange} ({meta.priceChangePct >= 0 ? '+' : ''}{meta.priceChangePct}%)
                </div>
              </div>
            </div>

            {/* Scorecards & Metric Cards */}
            <MetricCard
              fundamentals={stockOverview.fundamentals}
              risk={stockOverview.risk}
              technicals={stockOverview.technicals}
            />

            {/* Multi-Horizon Real-Time Price Estimation Engine */}
            <PriceEstimates
              estimates={stockOverview.priceEstimates}
              currency={meta.currency}
              currentPrice={meta.currentPrice}
            />

            {/* Two-Column Institutional Layout: Interactive Chart on Left, Live News Feed on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              
              {/* Left Column (2 Cols): Interactive Price Action & Indicator Series */}
              <div className="lg:col-span-2">
                <StockChart
                  history={stockHistory?.history}
                  chartSeries={stockHistory?.chartSeries}
                  currency={meta.currency}
                  period={period}
                  onPeriodChange={(p) => setPeriod(p)}
                />
              </div>

              {/* Right Column (1 Col): Live News & Market Situation Feed */}
              <div className="lg:col-span-1">
                <NewsColumn
                  news={stockOverview.news || []}
                  symbol={meta.symbol || activeSymbol}
                  onRefresh={handleRefreshNews}
                  loading={newsLoading}
                />
              </div>

            </div>

            {/* AI Quantitative Research Digest */}
            <AIReport report={aiReport} />

          </div>
        ) : null}

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#0d121f] py-6 px-4 text-center text-xs text-gray-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span>Alladin — Institutional Intelligence & Continuous Telemetry Engine</span>
          </div>
          <div className="text-gray-400">
            SEBI Compliant Research Engine • Real-Time Stock Monitoring & Situation Intelligence
          </div>
        </div>
      </footer>

    </div>
  );
}
