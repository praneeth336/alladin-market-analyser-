import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, ShieldCheck, Activity, Globe } from 'lucide-react';
import axios from 'axios';

export default function Header({ activeSymbol, onSelectSymbol, marketOverview }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (query.trim().length >= 1) {
      axios.get(`/api/search?q=${encodeURIComponent(query)}`)
        .then(res => {
          setSuggestions(res.data);
          setIsOpen(true);
        })
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [query]);

  const handleSelect = (symbol) => {
    onSelectSymbol(symbol);
    setQuery('');
    setIsOpen(false);
  };

  const nifty = marketOverview?.NIFTY50 || { price: 0, changePct: 0 };
  const sp500 = marketOverview?.SP500 || { price: 0, changePct: 0 };

  return (
    <header className="border-b border-gray-800 bg-[#111827]/90 backdrop-blur sticky top-0 z-50 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Market Indices */}
        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Alladin <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">AI 1.0</span>
              </h1>
              <p className="text-xs text-gray-400">Institutional Stock Intelligence</p>
            </div>
          </div>

          {/* Quick Index Tickers */}
          <div className="hidden lg:flex items-center gap-4 text-xs border-l border-gray-800 pl-6">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium">Nifty 50:</span>
              <span className="font-semibold text-white">{nifty.price ? nifty.price.toLocaleString() : 'Loading...'}</span>
              <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${nifty.changePct >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {nifty.changePct >= 0 ? '+' : ''}{nifty.changePct}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium">S&P 500:</span>
              <span className="font-semibold text-white">{sp500.price ? sp500.price.toLocaleString() : 'Loading...'}</span>
              <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${sp500.changePct >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {sp500.changePct >= 0 ? '+' : ''}{sp500.changePct}%
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar with Autocomplete */}
        <div className="relative w-full md:w-96">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 1 && setIsOpen(true)}
              placeholder="Search all 50 Nifty companies (e.g. HDFC, Tata, ITC, SBI) or US tickers..."
              className="w-full pl-10 pr-4 py-2 bg-gray-900/80 border border-gray-700/80 focus:border-blue-500 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#111827] border border-gray-700/80 rounded-lg shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto divide-y divide-gray-800">
              {suggestions.map((item) => (
                <button
                  key={item.symbol}
                  onClick={() => handleSelect(item.symbol)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-800/80 flex items-center justify-between transition-colors text-sm"
                >
                  <div className="min-w-0 pr-3">
                    <div className="font-semibold text-white flex items-center gap-2">
                      <span>{item.symbol}</span>
                      {item.weight && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {item.weight}% Wt
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 truncate">{item.name}</div>
                  </div>
                  <span className="text-xs text-cyan-400 font-medium shrink-0">{item.sector}</span>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
