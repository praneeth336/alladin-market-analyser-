import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { Activity, Layers } from 'lucide-react';

export default function StockChart({ history = [], chartSeries = [], currency = 'INR', period, onPeriodChange }) {
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showSMA200, setShowSMA200] = useState(false);
  const [showRSI, setShowRSI] = useState(false);

  // Combine history OHLCV and technical series for charting
  const mergedData = (chartSeries.length > 0 ? chartSeries : history).map((item, idx) => {
    const hist = history[idx] || {};
    return {
      ...hist,
      ...item,
      open: item.open ?? hist.open ?? item.close,
      high: item.high ?? hist.high ?? item.close,
      low: item.low ?? hist.low ?? item.close
    };
  });

  const periods = [
    { label: '1M', value: '1m' },
    { label: '6M', value: '6m' },
    { label: '1Y', value: '1y' },
    { label: '5Y', value: '5y' }
  ];

  const formatCurrency = (val) => `${currency === 'INR' ? '₹' : '$'}${val}`;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload || {};
      const openPrice = data.open != null ? formatCurrency(data.open) : 'N/A';
      const maxPrice = data.high != null ? formatCurrency(data.high) : 'N/A';
      const closePrice = data.close != null ? formatCurrency(data.close) : 'N/A';

      return (
        <div className="bg-[#111827] border border-gray-700/90 rounded-lg p-3 shadow-2xl text-xs space-y-1.5 min-w-[180px] pointer-events-none">
          <div className="font-semibold text-gray-300 pb-1.5 mb-1 border-b border-gray-800 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-gray-500 font-medium">Daily Metrics</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-400">Close Price:</span>
            <span className="font-bold text-blue-400">{closePrice}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-400">Open Price:</span>
            <span className="font-semibold text-gray-200">{openPrice}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-400">Max Price (High):</span>
            <span className="font-bold text-emerald-400">{maxPrice}</span>
          </div>

          {/* Active Overlay Indicators */}
          {showSMA20 && data.sma20 != null && (
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-800 text-[11px]">
              <span className="text-amber-400 font-medium">SMA 20:</span>
              <span className="text-gray-300">{formatCurrency(data.sma20)}</span>
            </div>
          )}
          {showSMA50 && data.sma50 != null && (
            <div className="flex items-center justify-between gap-4 text-[11px]">
              <span className="text-blue-400 font-medium">SMA 50:</span>
              <span className="text-gray-300">{formatCurrency(data.sma50)}</span>
            </div>
          )}
          {showSMA200 && data.sma200 != null && (
            <div className="flex items-center justify-between gap-4 text-[11px]">
              <span className="text-purple-400 font-medium">SMA 200:</span>
              <span className="text-gray-300">{formatCurrency(data.sma200)}</span>
            </div>
          )}
          {showRSI && data.rsi != null && (
            <div className="flex items-center justify-between gap-4 text-[11px]">
              <span className="text-cyan-400 font-medium">RSI (14):</span>
              <span className="text-gray-300">{data.rsi}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 mb-6 shadow-sm">
      
      {/* Chart Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-gray-800">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" /> Technical Price Action & Indicator Series
          </h2>
          <p className="text-xs text-gray-400">Interactive OHLCV candlestick representation with trend moving averages</p>
        </div>

        {/* Time Period Selector */}
        <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-lg border border-gray-800">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => onPeriodChange(p.value)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                period === p.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Indicator Toggles */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
        <span className="text-gray-400 font-medium flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-400" /> Overlays:
        </span>
        <button
          onClick={() => setShowSMA20(!showSMA20)}
          className={`px-2.5 py-1 rounded border font-medium transition-all ${
            showSMA20
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-gray-900 text-gray-500 border-gray-800 hover:text-gray-300'
          }`}
        >
          SMA 20
        </button>
        <button
          onClick={() => setShowSMA50(!showSMA50)}
          className={`px-2.5 py-1 rounded border font-medium transition-all ${
            showSMA50
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              : 'bg-gray-900 text-gray-500 border-gray-800 hover:text-gray-300'
          }`}
        >
          SMA 50
        </button>
        <button
          onClick={() => setShowSMA200(!showSMA200)}
          className={`px-2.5 py-1 rounded border font-medium transition-all ${
            showSMA200
              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
              : 'bg-gray-900 text-gray-500 border-gray-800 hover:text-gray-300'
          }`}
        >
          SMA 200
        </button>
        <button
          onClick={() => setShowRSI(!showRSI)}
          className={`px-2.5 py-1 rounded border font-medium transition-all ${
            showRSI
              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
              : 'bg-gray-900 text-gray-500 border-gray-800 hover:text-gray-300'
          }`}
        >
          RSI Oscillator
        </button>
      </div>

      {/* Main Chart Area */}
      <div className="h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={mergedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} />
            
            {/* Left Y Axis for Price */}
            <YAxis
              yAxisId="price"
              domain={['auto', 'auto']}
              stroke="#9ca3af"
              fontSize={11}
              tickFormatter={(v) => formatCurrency(v)}
            />

            {/* Right Y Axis for Volume */}
            <YAxis
              yAxisId="volume"
              orientation="right"
              domain={[0, 'dataMax * 4']}
              hide
            />

            {/* Right Y Axis for RSI if toggled */}
            {showRSI && (
              <YAxis yAxisId="rsi" orientation="right" domain={[0, 100]} stroke="#06b6d4" fontSize={11} />
            )}

            <Tooltip content={<CustomTooltip />} />

            {/* Volume Bars */}
            <Bar yAxisId="volume" dataKey="volume" fill="#1f2937" opacity={0.6} radius={[2, 2, 0, 0]} />

            {/* Price Line */}
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="close"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Close Price"
            />

            {/* Moving Average Overlay Lines */}
            {showSMA20 && (
              <Line yAxisId="price" type="monotone" dataKey="sma20" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="SMA 20" />
            )}
            {showSMA50 && (
              <Line yAxisId="price" type="monotone" dataKey="sma50" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="SMA 50" />
            )}
            {showSMA200 && (
              <Line yAxisId="price" type="monotone" dataKey="sma200" stroke="#a855f7" strokeWidth={1.5} dot={false} name="SMA 200" />
            )}

            {/* RSI Line */}
            {showRSI && (
              <Line yAxisId="rsi" type="monotone" dataKey="rsi" stroke="#06b6d4" strokeWidth={1.5} dot={false} name="RSI (14)" />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
