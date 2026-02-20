import React from 'react';
import { Cpu, Gauge, Wifi, Shield, Activity } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="app-footer">
            <div className="footer-glow-line"></div>
            <div className="footer-content">
                <div className="footer-left">
                    <span className="footer-chip">
                        <Cpu size={13} className="text-amber-500" />
                        <span>YOLOv8-RoadSafe</span>
                    </span>
                    <span className="footer-chip">
                        <Gauge size={13} className="text-amber-500" />
                        <span>Accuracy: <strong className="text-amber-400">94.7%</strong></span>
                    </span>
                    <span className="footer-chip">
                        <Activity size={13} className="text-green-500" />
                        <span>Latency: <strong className="text-green-400">23ms</strong></span>
                    </span>
                </div>

                <div className="footer-center">
                    <Shield size={12} className="text-amber-500" />
                    <span>Rakshak Sentinel v2.1.0 — Empowering Safer Roads Through AI</span>
                </div>

                <div className="footer-right">
                    <span className="footer-chip">
                        <Wifi size={13} className="text-green-500" />
                        <span className="text-green-400">Connected</span>
                    </span>
                    <div className="footer-progress">
                        <div className="footer-progress-bar"></div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
