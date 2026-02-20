import React, { useState } from 'react';
import { X, Download, TrendingUp, AlertTriangle, MapPin, PieChart, BarChart3, Calendar } from 'lucide-react';

export default function LocationAnalytics({ locationName, onClose }) {
    const [downloading, setDownloading] = useState(false);

    // Mock Data Generators
    const riskScore = 78; // 0-100
    const accidentsTrend = [12, 19, 15, 22, 28, 24, 32]; // Last 7 days
    const severityDist = { low: 45, medium: 30, critical: 25 };

    const handleDownload = () => {
        setDownloading(true);
        // Simulate generation
        setTimeout(() => {
            setDownloading(false);
            alert("Report downloaded: " + locationName + "_Analysis.pdf");
        }, 2000);
    };

    return (
        <div className="analytics-overlay glass-card glass-card-glow animate-in fade-in zoom-in">
            <div className="analytics-header">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <PieChart size={18} className="text-amber-500" />
                        Location Analytics
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <MapPin size={10} />
                        <span className="uppercase tracking-wider">{locationName || "HYDERABAD REGION"}</span>
                    </div>
                </div>
                <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                    <X size={20} className="text-slate-300" />
                </button>
            </div>

            <div className="analytics-scroll-content">

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                        <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Risk Index</div>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-red-500">{riskScore}</span>
                            <span className="text-xs text-red-400 mb-1">/ 100</span>
                        </div>
                        <div className="w-full bg-white/10 h-1 mt-2 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500" style={{ width: `${riskScore}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                        <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Incidents (7d)</div>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-amber-500">152</span>
                            <span className="text-xs text-green-400 mb-1 flex items-center">
                                <TrendingUp size={10} className="mr-1" /> +12%
                            </span>
                        </div>
                        {/* Mini Sparkline */}
                        <div className="h-6 flex items-end gap-1 mt-1 opacity-50">
                            {accidentsTrend.map((v, i) => (
                                <div key={i} className="bg-amber-500 w-full rounded-t-sm" style={{ height: `${(v / 40) * 100}%` }}></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Severity Distribution (Bar Chart) */}
                <div className="bg-white/5 p-4 rounded-lg border border-white/5 mb-4">
                    <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                        <BarChart3 size={12} className="text-blue-400" /> SEVERITY BREAKDOWN
                    </h4>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-300">
                                <span>Critical (Fatalities/Severe)</span>
                                <span>{severityDist.critical}%</span>
                            </div>
                            <div className="w-full bg-black/30 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 animate-pulse-slow" style={{ width: `${severityDist.critical}%` }}></div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-300">
                                <span>High (Major Damage)</span>
                                <span>{severityDist.medium}%</span>
                            </div>
                            <div className="w-full bg-black/30 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500" style={{ width: `${severityDist.medium}%` }}></div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-300">
                                <span>Moderate (Minor)</span>
                                <span>{severityDist.low}%</span>
                            </div>
                            <div className="w-full bg-black/30 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{ width: `${severityDist.low}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trend Graph (SVG) */}
                <div className="bg-white/5 p-4 rounded-lg border border-white/5 mb-4">
                    <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                        <Calendar size={12} className="text-purple-400" /> MONTHLY TREND
                    </h4>
                    <div className="h-24 w-full relative border-l border-b border-white/10 flex items-end px-2 pb-2">
                        {/* Svg Trend Line */}
                        <svg className="absolute inset-0 w-full h-full p-2" viewBox="0 0 100 50" preserveAspectRatio="none">
                            <path d="M0,45 L15,35 L30,40 L45,20 L60,25 L75,10 L90,15 L100,5" fill="none" stroke="var(--amber-500)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                            <path d="M0,45 L15,35 L30,40 L45,20 L60,25 L75,10 L90,15 L100,5 L100,50 L0,50 Z" fill="url(#grad1)" opacity="0.2" />
                            <defs>
                                <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: 'var(--amber-500)', stopOpacity: 1 }} />
                                    <stop offset="100%" style={{ stopColor: 'var(--amber-500)', stopOpacity: 0 }} />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>

            </div>

            <div className="analytics-footer pt-3 mt-auto border-t border-white/10">
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full bg-white text-black hover:bg-slate-200 font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
                >
                    {downloading ? 'GENERATING REPORT...' : <><Download size={14} /> DOWNLOAD FULL REPORT</>}
                </button>
            </div>
        </div>
    );
}
