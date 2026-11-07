import React from 'react';
import { Shield, DollarSign, Activity, Percent, Scale, TrendingUp, AlertTriangle } from 'lucide-react';

export default function MetricCard({ fundamentals, risk, technicals }) {
  if (!fundamentals) return null;

  const ratios = fundamentals.ratios || {};
  const overallScore = fundamentals.overallScore || 50;

  const getScoreBadge = (score) => {
    if (score >= 75) return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Strong Health' };
    if (score >= 55) return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Moderate' };
    return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Caution' };
  };

  const badge = getScoreBadge(overallScore);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      
      {/* 1. Overall Financial Health Card */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Overall Health Score</span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Shield className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-white">{overallScore}</span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
          <span className="text-gray-400">Status:</span>
          <span className={`px-2 py-0.5 rounded font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* 2. Valuation & Solvency Card */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Valuation & Solvency</span>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-gray-400">P/E Ratio</div>
            <div className="text-base font-semibold text-white mt-0.5">{ratios.peRatio || 'N/A'}</div>
          </div>
          <div>
            <div className="text-gray-400">Debt/Equity</div>
            <div className="text-base font-semibold text-white mt-0.5">{ratios.debtToEquity || 'N/A'}</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
          <span className="text-gray-400">Valuation:</span>
          <span className="text-gray-200 font-medium truncate max-w-[130px]">{fundamentals.valuationStatus}</span>
        </div>
      </div>

      {/* 3. Profitability & Returns Card */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Profitability & ROE</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-gray-400">Return on Equity</div>
            <div className="text-base font-semibold text-white mt-0.5">{ratios.returnOnEquity}</div>
          </div>
          <div>
            <div className="text-gray-400">Profit Margin</div>
            <div className="text-base font-semibold text-white mt-0.5">{ratios.profitMargin}</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
          <span className="text-gray-400">Dividend Yield:</span>
          <span className="text-emerald-400 font-medium">{ratios.dividendYield}</span>
        </div>
      </div>

      {/* 4. Quantitative Risk Profile Card */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quantitative Risk Profile</span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-gray-400">Max Drawdown</div>
            <div className="text-base font-semibold text-rose-400 mt-0.5">{risk?.maxDrawdownPct || 0}%</div>
          </div>
          <div>
            <div className="text-gray-400">Sharpe Ratio</div>
            <div className="text-base font-semibold text-white mt-0.5">{risk?.sharpeRatio || 0}</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
          <span className="text-gray-400">Volatility / Beta:</span>
          <span className="text-amber-400 font-medium">{risk?.volatilityPct}% (β {risk?.beta})</span>
        </div>
      </div>

    </div>
  );
}
