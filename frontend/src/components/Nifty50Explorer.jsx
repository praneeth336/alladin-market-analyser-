import React, { useState, useEffect } from 'react';
import { Layers, ChevronDown, ChevronUp, Search, TrendingUp, Building2, CheckCircle2, Sparkles, Filter } from 'lucide-react';
import axios from 'axios';

export default function Nifty50Explorer({ activeSymbol, onSelectSymbol }) {
  const [companies, setCompanies] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/nifty50')
      .then(res => {
        setCompanies(res.data.companies || []);
        setSectors(res.data.sectors || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredCompanies = companies.filter(c => {
    const matchesSector = selectedSector === 'ALL' || c.sector === selectedSector;
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = !query || (
      c.symbol.toLowerCase().includes(query) ||
      c.name.toLowerCase().includes(query) ||
      (c.shortName && c.shortName.toLowerCase().includes(query)) ||
      c.sector.toLowerCase().includes(query)
    );
    return matchesSector && matchesSearch;
  });

  const getSectorColor = (sector) => {
    switch (sector) {
      case 'Banking & Finance': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Information Technology': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'Oil, Gas & Energy': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Automotive': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'Consumer Goods (FMCG)': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Pharma & Healthcare': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Metals & Mining': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'Infra & Engineering': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'Telecom & Retail': return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
      default: return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 sm:p-5 mb-6 shadow-sm">
      
      {/* Bar Header / Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                NIFTY 50 Index Constituents
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                All 50 Companies
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Explore India's benchmark index constituents across 9 key sectors with unified telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-blue-400 border border-gray-800 transition-all"
          >
            <Layers className="w-3.5 h-3.5" />
            {isExpanded ? 'Collapse Explorer' : 'Explore All 50 Companies'}
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Quick Horizontal Sector Selector & Fast-Pills */}
      <div className="mt-3.5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedSector('ALL')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
              selectedSector === 'ALL'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800'
            }`}
          >
            All Sectors ({companies.length})
          </button>
          {sectors.map(sector => {
            const count = companies.filter(c => c.sector === sector).length;
            const isSelected = selectedSector === sector;
            return (
              <button
                key={sector}
                onClick={() => {
                  setSelectedSector(sector);
                  if (!isExpanded) setIsExpanded(true);
                }}
                className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                    : 'bg-gray-900 text-gray-400 hover:text-gray-200 border-gray-800'
                }`}
              >
                {sector} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded Grid of NIFTY 50 Companies */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          
          {/* Sub-search input inside explorer */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter company, ticker or sector..."
                className="w-full pl-9 pr-3 py-1.5 bg-gray-900 border border-gray-800 focus:border-blue-500 rounded-lg text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              />
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1.5">
              <span>Showing <strong>{filteredCompanies.length}</strong> of {companies.length} companies</span>
            </div>
          </div>

          {/* Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[420px] overflow-y-auto pr-1">
            {filteredCompanies.map(c => {
              const isSelected = activeSymbol === c.symbol;
              const sectorColor = getSectorColor(c.sector);

              return (
                <button
                  key={c.symbol}
                  onClick={() => onSelectSymbol(c.symbol)}
                  className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500/30 shadow-md shadow-blue-500/10'
                      : 'bg-gray-900/80 border-gray-800 hover:border-gray-700 hover:bg-gray-850'
                  }`}
                >
                  <div>
                    {/* Top row: Symbol and Weight */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-sm text-white flex items-center gap-1.5">
                        {c.symbol}
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        )}
                      </div>
                      {c.weight && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-gray-800 text-gray-300 border border-gray-700">
                          {c.weight}% Wt
                        </span>
                      )}
                    </div>

                    {/* Corporate Name */}
                    <div className="text-xs text-gray-300 font-medium truncate mb-2">
                      {c.name}
                    </div>
                  </div>

                  {/* Bottom row: Sector badge and quick P/E */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-800/60 text-[10px]">
                    <span className={`px-1.5 py-0.5 rounded font-semibold border ${sectorColor} truncate max-w-[125px]`}>
                      {c.sector}
                    </span>
                    <span className="text-gray-400 font-mono">
                      P/E: <strong className="text-gray-200">{c.peRatio || 'N/A'}</strong>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}
