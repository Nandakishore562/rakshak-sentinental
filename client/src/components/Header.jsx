import React, { useState, useEffect } from 'react';
import { ShieldCheck, Database, Settings, Cloud, Wifi, Zap, Bell } from 'lucide-react';

export default function Header({ user, onProfileClick }) {
    const [time, setTime] = useState(new Date());
    const [threatLevel] = useState(72);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="app-header">
            {/* Animated top border */}
            <div className="header-glow-line"></div>

            <div className="header-content">
                {/* Left: Brand */}
                <div className="header-left">
                    <div className="logo-mark">
                        <svg viewBox="0 0 44 44" className="logo-svg">
                            <defs>
                                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ffb800" />
                                    <stop offset="100%" stopColor="#ff6b35" />
                                </linearGradient>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                </filter>
                            </defs>
                            <polygon points="22,3 40,34 4,34" fill="none" stroke="url(#logoGrad)" strokeWidth="2.5" filter="url(#glow)" />
                            <circle cx="22" cy="24" r="3.5" fill="url(#logoGrad)" filter="url(#glow)" />
                            <line x1="22" y1="12" x2="22" y2="19" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round" filter="url(#glow)" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="brand-name">RAKSHAK SENTINEL</h1>
                        <p className="tagline">
                            <Zap size={10} className="inline text-amber-500" /> DATA-DRIVEN CIVIC ACTION
                        </p>
                    </div>
                </div>

                {/* Center: Status Pills */}
                <div className="header-center">
                    <div className="status-pill live">
                        <span className="pulse-dot"></span>
                        SYSTEM LIVE
                    </div>
                    <div className="status-pill">
                        <ShieldCheck size={13} />
                        AI Engine v2.1
                    </div>
                    <div className="status-pill">
                        <Database size={13} />
                        2,847 Records
                    </div>
                    <div className="status-pill">
                        <Cloud size={13} />
                        <span className="threat-meter">
                            <span className="threat-fill" style={{ width: `${threatLevel}%` }}></span>
                        </span>
                        {threatLevel}% Alert
                    </div>
                </div>

                {/* Right: Clock + Actions */}
                <div className="header-right">
                    <div className="clock-display">
                        <div className="clock-time">
                            {time.toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                        </div>
                        <div className="clock-date">
                            {time.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                    </div>
                    {user && (
                        <div
                            onClick={onProfileClick}
                            className="flex items-center gap-3 px-3 py-1 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors group select-none"
                            title="View Profile"
                        >
                            <div className="text-right hidden md:block">
                                <div className="text-xs font-bold text-white leading-tight group-hover:text-amber-400 transition-colors">{user.name}</div>
                                <div className="text-[10px] text-amber-500 font-medium">{user.reports} Reports Filed</div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-amber-900/40 border border-white/20 group-hover:border-amber-500/50 transition-colors">
                                {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                        </div>
                    )}
                    <button className="header-btn notification-btn">
                        <Bell size={16} />
                        <span className="notification-badge">3</span>
                    </button>
                    <button className="header-btn">
                        <Settings size={16} />
                    </button>
                </div>
            </div>
        </header>
    );
}
