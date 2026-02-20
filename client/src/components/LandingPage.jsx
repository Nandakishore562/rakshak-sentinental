import React, { useEffect, useState } from 'react';
import { Shield, ChevronRight } from 'lucide-react';

export default function LandingPage({ onEnter }) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(true);
    }, []);

    return (
        <div className="landing-container">
            <div className="landing-grid-bg"></div>

            <div className={`landing-content ${loaded ? 'visible' : ''}`}>
                <div className="logo-hero-wrapper">
                    <div className="logo-shield-large">
                        <Shield size={120} strokeWidth={1} className="shield-icon-large" />
                        <div className="shield-inner-circuit"></div>
                        <div className="shield-eye"></div>
                    </div>
                    <div className="logo-glow-ring"></div>
                </div>

                <h1 className="landing-title">
                    <span className="text-white">RAKSHAK</span> <span className="text-amber-500">SENTINEL</span>
                </h1>
                <p className="landing-subtitle">AI-POWERED CIVIC DEFENSE SYSTEM</p>

                <button onClick={onEnter} className="enter-portal-btn">
                    <span>ENTER SECURE PORTAL</span>
                    <ChevronRight size={20} />
                </button>

                <div className="landing-footer">
                    <p>AUTHORIZED ACCESS ONLY • SYSTEM V2.1</p>
                </div>
            </div>
        </div>
    );
}
