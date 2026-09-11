import React, { useState, useEffect } from 'react';
import { Activity, Search, Filter, ExternalLink, X, TrendingUp, Compass, Calendar, ArrowUpRight } from 'lucide-react';
import { requestApi } from '../lib/api';
import type { ChartRecord } from '../types';

export const ChartSection: React.FC = () => {
  const [charts, setCharts] = useState<ChartRecord[]>([]);
  const [selectedChart, setSelectedChart] = useState<ChartRecord | null>(null);
  const [marketFilter, setMarketFilter] = useState('ALL');
  const [timeframeFilter, setTimeframeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCharts();
  }, []);

  const fetchCharts = async () => {
    setIsLoading(true);
    try {
      const data = await requestApi<ChartRecord[]>('/api/charts');
      setCharts(data);
    } catch (err) {
      console.error('Failed to fetch charts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCharts = charts.filter((c) => {
    const matchesMarket = marketFilter === 'ALL' || c.market.toLowerCase() === marketFilter.toLowerCase();
    const matchesTimeframe = timeframeFilter === 'ALL' || c.timeframe === timeframeFilter;
    const matchesSearch =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instrument.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.analysis.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMarket && matchesTimeframe && matchesSearch;
  });

  return (
    <section id="charts" className="py-20 bg-[#07090e] border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono">
              <Activity className="w-3.5 h-3.5" />
              <span>AJT77 PRICE ACTION VAULT</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
              Live Chart Breakdown
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl">
              Real price action setups, institutional liquidity observations, and structural orderflow analysis published by Ajay Gadhe.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{charts.length} Published Technical Studies</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Market Filter */}
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-slate-400 mr-1 font-medium">Market:</span>
              {['ALL', 'Indian Equities', 'Forex', 'Crypto'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMarketFilter(m)}
                  className={`px-2.5 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                    marketFilter === m
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {m === 'ALL' ? 'All Markets' : m}
                </button>
              ))}
            </div>

            {/* Timeframe Filter */}
            <div className="hidden sm:flex items-center space-x-1 text-xs pl-3 border-l border-slate-800">
              <span className="text-slate-400 mr-1 font-medium">TF:</span>
              {['ALL', '15m', '1H', '4H', '1D'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframeFilter(tf)}
                  className={`px-2 py-1 rounded-md font-mono cursor-pointer transition-colors ${
                    timeframeFilter === tf
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search instrument or setup..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#101626] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Charts Grid */}
        {isLoading ? (
          <div className="text-center py-20 text-slate-500 text-sm font-mono">
            Loading AJT77 Chart Database...
          </div>
        ) : filteredCharts.length === 0 ? (
          <div className="text-center py-16 bg-[#0b0f19] border border-slate-800 rounded-2xl p-8 space-y-2">
            <Compass className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-white">No charts match your filter criteria</p>
            <p className="text-xs text-slate-400">Try adjusting the market filter or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCharts.map((chart) => (
              <div
                key={chart.id}
                id={`chart-card-${chart.id}`}
                onClick={() => setSelectedChart(chart)}
                className="group bg-[#0b0f19] border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Chart Image Thumbnail with Hover overlay */}
                  <div className="relative aspect-video w-full bg-[#080b12] overflow-hidden">
                    <img
                      src={chart.chart_image_url}
                      alt={chart.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-transparent to-transparent opacity-80" />
                    <div className="absolute top-3 left-3 flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[10px] font-mono font-bold text-sky-400 border border-sky-500/20">
                        {chart.instrument}
                      </span>
                      <span className="px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[10px] font-mono text-slate-300 border border-slate-700">
                        {chart.timeframe}
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-3">
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-mono font-bold border border-emerald-500/30">
                        RR {chart.risk_reward}
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors line-clamp-2">
                      {chart.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {chart.analysis}
                    </p>
                  </div>
                </div>

                {/* Levels Bar & Footer */}
                <div className="p-5 pt-0">
                  <div className="bg-[#101524] rounded-xl p-2.5 border border-slate-800/80 grid grid-cols-3 gap-2 text-[11px] font-mono text-center">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Entry</span>
                      <span className="text-sky-300 font-semibold">{chart.entry || 'Market'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Stop Loss</span>
                      <span className="text-rose-400 font-semibold">{chart.stop_loss || 'Key Level'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Target</span>
                      <span className="text-emerald-400 font-semibold">{chart.target || 'Liquidity'}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>By {chart.created_by}</span>
                    <span className="flex items-center text-sky-400 group-hover:translate-x-0.5 transition-transform">
                      View Breakdown <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chart Detail Full Modal */}
      {selectedChart && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b0f19] border border-slate-700/80 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex justify-between items-start px-6 pt-6 pb-2 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 rounded text-xs font-mono font-bold">
                    {selectedChart.instrument}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-xs font-mono">
                    {selectedChart.market} • {selectedChart.timeframe}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-xs font-mono">
                    R:R {selectedChart.risk_reward}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">{selectedChart.title}</h3>
              </div>
              <button
                id="close-chart-modal-btn"
                onClick={() => setSelectedChart(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 space-y-5">
              {/* High-res image */}
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#07090e] max-h-[420px]">
                <img
                  src={selectedChart.chart_image_url}
                  alt={selectedChart.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain max-h-[420px] mx-auto"
                />
              </div>

              {/* Technical breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-[#0f1422] p-4 rounded-xl border border-slate-800 space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Detailed Price Action Observation</p>
                  <p className="text-sm text-slate-200 leading-relaxed">{selectedChart.analysis}</p>
                </div>

                <div className="bg-[#0f1422] p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Key Trade Metrics</p>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                    <span className="text-slate-400">Entry Trigger:</span>
                    <span className="text-sky-400 font-bold">{selectedChart.entry}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                    <span className="text-slate-400">Stop Invalidation:</span>
                    <span className="text-rose-400 font-bold">{selectedChart.stop_loss}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                    <span className="text-slate-400">Target Objective:</span>
                    <span className="text-emerald-400 font-bold">{selectedChart.target}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">Risk-to-Reward:</span>
                    <span className="text-indigo-400 font-bold">{selectedChart.risk_reward}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#090d16] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Published by {selectedChart.created_by} • Educational Study</span>
              <button
                onClick={() => setSelectedChart(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
