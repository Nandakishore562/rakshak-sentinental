import React from 'react';
import { ArrowLeft, MapPin, Phone, Mail, Award, FileText, CheckCircle, Clock } from 'lucide-react';

export default function UserProfile({ user, onBack }) {
    if (!user) return null;

    // Mock recent activity if not provided throughout app
    const activities = [
        { id: 1, type: 'report', title: 'Pothole Reported at MG Road', time: '2 hours ago', status: 'Pending' },
        { id: 2, type: 'resolved', title: 'Accident High-Risk Zone Verified', time: '1 day ago', status: 'Resolved' },
        { id: 3, type: 'report', title: 'Street Light Malfunction', time: '3 days ago', status: 'In Progress' },
    ];

    return (
        <div className="p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-amber-500 transition-colors mb-6 group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1">
                    <div className="glass-card p-6 flex flex-col items-center text-center border-t-4 border-t-amber-500">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-4xl shadow-2xl shadow-amber-900/40 border-4 border-black mb-4">
                            {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                        <p className="text-amber-500 font-medium mb-4">{user.role || 'Civic Guardian'}</p>

                        <div className="w-full space-y-3 text-left bg-black/20 p-4 rounded-lg border border-white/5">
                            <div className="flex items-center gap-3 text-slate-300 text-sm">
                                <Award size={16} className="text-amber-500" />
                                <span>ID: <span className="text-white font-mono">{user.id || 'N/A'}</span></span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300 text-sm">
                                <Mail size={16} className="text-amber-500" />
                                <span>official@rakshak.org</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300 text-sm">
                                <Phone size={16} className="text-amber-500" />
                                <span>+91 98765-43210</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300 text-sm">
                                <MapPin size={16} className="text-amber-500" />
                                <span>Zone 4, Hyderabad</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats & Activity */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="glass-card p-5 border-l-4 border-l-blue-500">
                            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Reports</div>
                            <div className="text-3xl font-bold text-white flex items-end gap-2">
                                {user.reports}
                                <span className="text-sm text-green-500 font-normal mb-1">+12%</span>
                            </div>
                        </div>
                        <div className="glass-card p-5 border-l-4 border-l-green-500">
                            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Resolved Cases</div>
                            <div className="text-3xl font-bold text-white flex items-end gap-2">
                                84
                                <span className="text-sm text-green-500 font-normal mb-1">High Impact</span>
                            </div>
                        </div>
                        <div className="glass-card p-5 border-l-4 border-l-purple-500">
                            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Impact Score</div>
                            <div className="text-3xl font-bold text-white">
                                98.2
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FileText size={18} className="text-amber-500" /> Recent Activity
                        </h3>
                        <div className="space-y-4">
                            {activities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5">
                                    <div className={`mt-1 bg-black/40 p-2 rounded-full ${activity.status === 'Resolved' ? 'text-green-500' : 'text-amber-500'}`}>
                                        {activity.status === 'Resolved' ? <CheckCircle size={16} /> : <Clock size={16} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-medium text-white">{activity.title}</h4>
                                            <span className="text-[10px] text-slate-500 bg-black/30 px-2 py-0.5 rounded-full">{activity.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs px-2 py-0.5 rounded ${activity.status === 'Resolved' ? 'bg-green-500/10 text-green-400' :
                                                    activity.status === 'Pending' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                                                }`}>
                                                {activity.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
