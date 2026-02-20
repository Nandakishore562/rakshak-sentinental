import React, { useState } from 'react';
import { Shield, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Mock authentication
        setTimeout(() => {
            if (username === 'admin' && password === 'admin') {
                onLogin({
                    name: 'Officer Arjun',
                    id: 'OP-42',
                    role: 'Senior Inspector',
                    reports: 142,
                    avatar: null // Could add an image URL here
                });
            } else {
                setError('Invalid credentials. Access denied.');
                setLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="login-container">
            <div className="login-card glass-card">
                <div className="login-header">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-4 mx-auto border border-amber-500/30">
                        <Shield className="text-amber-500" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">System Login</h2>
                    <p className="text-slate-400 text-xs tracking-wider">SECURE GATEWAY</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label className="text-xs font-semibold text-slate-300 mb-1.5 block">OPERATOR ID</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-amber-500 focus:outline-none transition-colors"
                                placeholder="Enter ID"
                            />
                        </div>
                    </div>

                    <div className="form-group mb-6">
                        <label className="text-xs font-semibold text-slate-300 mb-1.5 block">PASSPHRASE</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-amber-500 focus:outline-none transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs flex items-center gap-2 mb-4 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20 transition-all hover:scale-[1.02]"
                    >
                        {loading ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> AUTHENTICATING...</>
                        ) : (
                            <>ACCESS SYSTEM <ArrowRight size={16} /></>
                        )}
                    </button>
                </form>

                <div className="login-footer text-center mt-6 pt-4 border-t border-white/5">
                    <p className="text-[10px] text-slate-500">RESTRICTED TO MUNICIPAL CORPORATION PERSONNEL</p>
                </div>
            </div>
        </div>
    );
}
