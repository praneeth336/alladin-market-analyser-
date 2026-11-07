import React from 'react';
import { Bot, FileText, AlertCircle, ShieldCheck, CheckCircle2, Bookmark } from 'lucide-react';

export default function AIReport({ report }) {
  if (!report) return null;

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-sm mb-8">
      
      {/* Report Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              AI Quantitative Research Digest
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Audited Payload
              </span>
            </h2>
            <p className="text-xs text-gray-400">Deterministic synthesis engine with strict grounded citations</p>
          </div>
        </div>

        <div className="text-xs text-gray-400 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          Target Ticker: <span className="font-semibold text-white">{report.symbol}</span>
        </div>
      </div>

      {/* Executive Summary Box */}
      <div className="bg-gradient-to-r from-blue-950/40 to-gray-900 border border-blue-800/40 rounded-lg p-4 mb-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2 flex items-center gap-1.5">
          <Bookmark className="w-3.5 h-3.5" /> Executive Summary
        </h3>
        <p className="text-sm text-gray-200 leading-relaxed font-normal">
          {report.executiveSummary}
        </p>
      </div>

      {/* Key Drivers Grid */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Fundamental & Technical Pillars
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.keyDrivers && report.keyDrivers.map((driver, idx) => (
            <div key={idx} className="bg-gray-900/80 border border-gray-800 rounded-lg p-3.5 text-xs text-gray-300 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 font-semibold flex items-center justify-center shrink-0 text-[11px]">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{driver}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Factors Narrative */}
      <div className="mb-6 bg-gray-900/60 border border-gray-800 rounded-lg p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" /> Risk Factors & Sector Exposure
        </h3>
        <p className="text-xs text-gray-300 leading-relaxed">
          {report.riskAssessment}
        </p>
      </div>

      {/* Metric Audit Citations */}
      {report.auditCitations && report.auditCitations.length > 0 && (
        <div className="mb-6">
          <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Audit Citations & Grounded Data Points</h4>
          <div className="flex flex-wrap gap-2 text-[11px]">
            {report.auditCitations.map((cite, idx) => (
              <span key={idx} className="bg-gray-900 text-gray-400 border border-gray-800 px-2.5 py-1 rounded">
                {cite}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* SEBI Compliance Disclaimer */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3.5 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-300/90 leading-normal">
          {report.sebiDisclaimer}
        </p>
      </div>

    </div>
  );
}
