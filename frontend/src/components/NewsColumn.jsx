import React, { useState } from 'react';
import { Newspaper, ExternalLink, TrendingUp, TrendingDown, Minus, RefreshCw, AlertCircle, Sparkles, Filter } from 'lucide-react';

export default function NewsColumn({ news = [], symbol = '', onRefresh, loading = false }) {
  const [filter, setFilter] = useState('ALL');

  const filteredNews = news.filter((item) => {
    if (filter === 'ALL') return true;
    if (filter === 'BULLISH') return item.sentiment === 'BULLISH';
    if (filter === 'BEARISH') return item.sentiment === 'BEARISH';
    if (filter === 'HIGH_IMPACT') return item.impactRating === 'HIGH IMPACT';
    return true;
  });

  const getSentimentBadge = (sentiment) => {
    if (sentiment === 'BULLISH') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <TrendingUp className="w-3 h-3" /> BULLISH
        </span>
      );
    }
    if (sentiment === 'BEARISH') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <TrendingDown className="w-3 h-3" /> BEARISH
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
        <Minus className="w-3 h-3" /> NEUTRAL
      </span>
    );
  };

  const getImpactBadge = (rating) => {
    if (rating === 'HIGH IMPACT') {
      return (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> HIGH IMPACT
        </span>
      );
    }
    if (rating === 'MODERATE IMPACT') {
      return (
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
          MODERATE
        </span>
      );
    }
    return (
      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-800">
        SITUATION
      </span>
    );
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-sm flex flex-col h-[520px]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Newspaper className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Market Situation & News
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                LIVE
              </span>
            </h2>
            <p className="text-[11px] text-gray-400">Catalysts & news driving {symbol} volatility</p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh News Feed"
          className="text-xs text-gray-400 hover:text-white p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-none text-[11px]">
        {[
          { key: 'ALL', label: 'All' },
          { key: 'HIGH_IMPACT', label: 'High Impact' },
          { key: 'BULLISH', label: 'Bullish' },
          { key: 'BEARISH', label: 'Bearish' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all whitespace-nowrap ${
              filter === tab.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-900 text-gray-400 hover:text-gray-200 border border-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* News Feed Stream (Scrollable) */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 divide-y divide-gray-800/60">
        {filteredNews.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-500">
            No news matching the "{filter}" filter right now.
          </div>
        ) : (
          filteredNews.map((item, idx) => (
            <div key={idx} className="pt-3 first:pt-0 group">
              
              {/* Badges & Meta */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {getSentimentBadge(item.sentiment)}
                  {getImpactBadge(item.impactRating)}
                </div>
                <span className="text-[10px] text-gray-400 shrink-0 font-medium">{item.publishedAt}</span>
              </div>

              {/* Title & Link */}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-gray-100 hover:text-blue-400 leading-snug flex items-start justify-between gap-1 transition-colors"
              >
                <span>{item.title}</span>
                <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-blue-400 shrink-0 mt-0.5" />
              </a>

              {/* Source Publisher */}
              <div className="text-[10px] text-gray-400 font-medium mt-1">
                Source: <span className="text-gray-300 font-semibold">{item.source}</span>
              </div>

              {/* Market Situation & Impact Takeaway */}
              {item.impactAnalysis && (
                <div className="mt-2 bg-gray-900/90 rounded-md p-2 border border-gray-800/80 text-[11px] text-gray-300 flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item.impactAnalysis}</span>
                </div>
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
}
