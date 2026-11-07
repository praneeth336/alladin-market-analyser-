import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Clock, Zap, Target, ArrowUpRight, ArrowDownRight, Layers, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function PriceEstimates({ estimates, currency = 'INR', currentPrice = 0 }) {
  const [expandedCard, setExpandedCard] = useState('1week');

  if (!estimates || Object.keys(estimates).length === 0) return null;

  const currencySymbol = currency === 'INR' ? '₹' : '$';

  const horizons = [
    { key: '1day', ...estimates['1day'] },
    { key: '1week', ...estimates['1week'] },
    { key: '1month', ...estimates['1month'] }
  ];

  const getBiasBadge = (bias) => {
    if (bias === 'BULLISH') {
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />,
        label: 'BULLISH BIAS'
      };
    }
    if (bias === 'BEARISH') {
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        icon: <TrendingDown className="w-3.5 h-3.5 text-rose-400" />,
        label: 'BEARISH BIAS'
      };
    }
    return {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      icon: <Clock className="w-3.5 h-3.5 text-blue-400" />,
      label: 'NEUTRAL DRIFT'
    };
  };

  const getSentimentPill = (sentiment) => {
    if (sentiment === 'Bullish' || sentiment === 'Positive') {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (sentiment === 'Bearish' || sentiment === 'Negative') {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
    return 'bg-gray-800 text-gray-400 border-gray-700';
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 mb-6 shadow-sm">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Multi-Horizon Price Estimation Engine
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Live Drift Model
              </span>
            </h2>
            <p className="text-xs text-gray-400">
              Real-time projections calibrated via technical momentum, volume pressure, volatility dispersion, and market beta
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-400 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Base Price: <span className="font-semibold text-white">{currencySymbol}{currentPrice?.toLocaleString()}</span>
        </div>
      </div>

      {/* 3 Horizon Projection Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {horizons.map((item) => {
          if (!item.targetPrice) return null;
          const badge = getBiasBadge(item.directionalBias);
          const isPositive = item.expectedReturnPct >= 0;
          const isExpanded = expandedCard === item.key;

          return (
            <div
              key={item.key}
              className={`bg-gray-900/90 border rounded-xl p-5 transition-all flex flex-col justify-between ${
                isExpanded ? 'border-cyan-500/40 shadow-lg shadow-cyan-500/5' : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div>
                {/* Card Top: Horizon Title & Directional Bias */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.label}</h3>
                    <span className="text-[11px] text-gray-400">{item.timeframe}</span>
                  </div>
                  <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}>
                    {badge.icon}
                    {badge.label}
                  </span>
                </div>

                {/* Target Price & Expected Return */}
                <div className="bg-[#111827] p-3.5 rounded-lg border border-gray-800 mb-4">
                  <div className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">Estimated Target Price</div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl font-black text-white">
                      {currencySymbol}{item.targetPrice?.toLocaleString()}
                    </span>
                    <span className={`text-xs font-bold flex items-center gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {isPositive ? '+' : ''}{item.expectedReturnPct}%
                    </span>
                  </div>
                </div>

                {/* Statistical Range Floor & Ceiling */}
                <div className="space-y-1.5 mb-4 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Support Floor (1-σ):</span>
                    <span className="font-semibold text-gray-200">{currencySymbol}{item.lowEstimate?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Resistance Ceiling (1-σ):</span>
                    <span className="font-semibold text-gray-200">{currencySymbol}{item.highEstimate?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Expected Volatility Band:</span>
                    <span className="font-semibold text-amber-400">±{item.volatilityRangePct}%</span>
                  </div>
                </div>
              </div>

              {/* Collapsible Real-Time Impact Factors */}
              <div>
                <button
                  onClick={() => setExpandedCard(isExpanded ? null : item.key)}
                  className="w-full pt-3 border-t border-gray-800 text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> View Real-Time Impacters ({item.impactFactors?.length || 0})
                  </span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isExpanded && item.impactFactors && item.impactFactors.length > 0 && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-gray-800/60">
                    {item.impactFactors.map((factor, idx) => (
                      <div key={idx} className="bg-[#111827] p-2.5 rounded-lg border border-gray-800 text-[11px]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-200">{factor.driver}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${getSentimentPill(factor.sentiment)}`}>
                            {factor.sentiment}
                          </span>
                        </div>
                        <p className="text-gray-400 leading-relaxed">{factor.impact}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Model Transparency Note */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-[11px] text-gray-400 flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong>Methodology:</strong> Multi-horizon estimates combine 14-period RSI drift, 50-day SMA mean-reversion pull, institutional volume ratio, and systematic benchmark Beta to calculate projected target bands with 68% statistical dispersion.
        </span>
      </div>

    </div>
  );
}
