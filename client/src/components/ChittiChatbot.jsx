import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Sparkles, MapPin, AlertTriangle, Phone, Mic, Volume2, MicOff, Globe, FileText, Download } from 'lucide-react';

const TRANSLATIONS = {
    en: {
        systemOnline: 'SYSTEM ONLINE. Identity: CHITTI 2.0. Tactical Assistance Ready. 🛡️',
        waiting: 'Waiting for command...',
        processing: 'PROCESSING DATA STREAM...',
        micOn: 'Listening...',
        micOff: 'Enter command...',
        operator: 'OPERATOR',
        chitti: 'CHITTI',
        suggestions: [
            { label: 'REPORT POTHOLE', icon: MapPin, cmd: 'report pothole' },
            { label: 'SCAN SECTOR', icon: Sparkles, cmd: 'scan area' },
            { label: 'ACCIDENT ZONES', icon: AlertTriangle, cmd: 'show accident zones' },
            { label: 'GET REPORTS', icon: FileText, cmd: 'download reports' },
        ]
    },
    te: {
        systemOnline: 'సిస్టమ్ ఆన్‌లైన్. గుర్తింపు: చిట్టి 2.0. రక్షక దళం సిద్ధంగా ఉంది. 🛡️',
        waiting: 'ఆదేశం కోసం వేచి ఉంది...',
        processing: 'డేటాను ప్రాసెస్ చేస్తోంది...',
        micOn: 'వినబడుతోంది...',
        micOff: 'ఆదేశాన్ని టైప్ చేయండి...',
        operator: 'ఆపరేటర్',
        chitti: 'చిట్టి',
        suggestions: [
            { label: 'గుంతను నివేదించండి', icon: MapPin, cmd: 'report pothole' },
            { label: 'ప్రాంతాన్ని స్కాన్ చేయండి', icon: Sparkles, cmd: 'scan area' },
            { label: 'ప్రమాద జోన్లు', icon: AlertTriangle, cmd: 'show accident zones' },
            { label: 'రిపోర్ట్స్ డౌన్‌లోడ్', icon: Download, cmd: 'download reports' },
        ]
    }
};

export default function ChittiChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [lang, setLang] = useState('en'); // 'en' | 'te'
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: TRANSLATIONS['en'].systemOnline },
        { id: 2, type: 'bot', text: TRANSLATIONS['en'].waiting }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);

    // Initial greeting update when lang changes
    useEffect(() => {
        setMessages([
            { id: 1, type: 'bot', text: TRANSLATIONS[lang].systemOnline },
            { id: 2, type: 'bot', text: TRANSLATIONS[lang].waiting }
        ]);
    }, [lang]);

    // File Download Simulation
    const handleDownload = () => {
        const link = document.createElement('a');
        const now = new Date();
        const reportContent = `RAKSHAK SENTINEL REPORT

Date: ${now.toLocaleString()}
Location: Vijayawada, AP

INCIDENT ANALYSIS:
------------------
Target: Road Surface Anomaly
Detection Type: High Density Pothole Cluster
Confidence Score: 96%
Severity: CRITICAL - Immediate Road Closure Advised

GPS Coordinates:
Lat: 16.5062
Lng: 80.6480

ACTION ITEMS:
1. Dispatch repair unit to sector.
2. Update municipal database.

Status: REPORT FILED`;

        link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(reportContent);
        link.download = `Rakshak_Pothole_Report_${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Voice Synthesis
    const speak = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = 1.1;
        utterance.rate = 1.0;

        const voices = window.speechSynthesis.getVoices();
        // Priorities: Telugu voice for 'te', Female English for 'en'
        let targetVoice = null;
        if (lang === 'te') {
            targetVoice = voices.find(v => v.lang.includes('te') || v.name.includes('Telugu') || v.name.includes('India'));
        }
        if (!targetVoice) {
            targetVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Google') || v.name.includes('Samantha'));
        }
        if (targetVoice) utterance.voice = targetVoice;

        window.speechSynthesis.speak(utterance);
    };

    // Voice Recognition
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = useRef(Recognition ? new Recognition() : null);

    useEffect(() => {
        if (recognition.current) {
            recognition.current.continuous = false;
            recognition.current.lang = lang === 'te' ? 'te-IN' : 'en-US';
            recognition.current.interimResults = false;

            recognition.current.onstart = () => setIsListening(true);
            recognition.current.onend = () => setIsListening(false);
            recognition.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (transcript) handleSend(transcript);
            };
        }
    }, [lang]);

    const toggleListening = () => {
        if (!recognition.current) {
            alert('Voice recognition not supported in this browser.');
            return;
        }
        if (isListening) recognition.current.stop();
        else {
            recognition.current.lang = lang === 'te' ? 'te-IN' : 'en-US';
            recognition.current.start();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = (text = inputValue) => {
        if (!text.trim()) return;

        // User message
        const newMsg = { id: Date.now(), type: 'user', text };
        setMessages(prev => [...prev, newMsg]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI Response
        setTimeout(() => {
            getBotResponse(text).then(botText => {
                setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: botText }]);
                setIsTyping(false);
                speak(botText); // Speak response

                // Trigger download if requested
                if (text.toLowerCase().includes('download') || text.toLowerCase().includes('report') || text.includes('రిపోర్ట్')) {
                    setTimeout(handleDownload, 1000);
                }
            });
        }, 1500);
    };

    const getBotResponse = async (query) => {
        const q = query.toLowerCase();

        // Telugu Keywords
        if (lang === 'te') {
            if (q.includes('గుంత') || q.includes('రిపోర్ట్') || q.includes('pothole'))
                return "ఆదేశం స్వీకరించబడింది. గుంతల నివేదిక ప్రక్రియ ప్రారంభించబడింది. దయచేసి ఫోటోను అప్‌లోడ్ చేయండి.";
            if (q.includes('ప్రమాద') || q.includes('జోన్') || q.includes('accident'))
                return "సెక్టార్ డేటాను విశ్లేషిస్తోంది... 23 ప్రమాదకరమైన జోన్‌లు గుర్తించబడ్డాయి. బెంజ్ సర్కిల్ వద్ద జాగ్రత్తగా ఉండండి.";
            if (q.includes('సహాయం') || q.includes('ఎమర్జెన్సీ') || q.includes('help'))
                return "అత్యవసర ప్రోటోకాల్ యాక్టివేట్ చేయబడింది. 108 కి కాల్ చేస్తోంది...";
            if (q.includes('నమస్తే') || q.includes('హలో'))
                return "నమస్తే! నేను చిట్టిని. నేను మీకు ఎలా సహాయపడగలను?";
            if (q.includes('డౌన్‌లోడ్') || q.includes('డేటా'))
                return "రిపోర్ట్‌ను సిద్ధం చేస్తున్నాను... ఇదిగో మీ ఫైల్ డౌన్‌లోడ్ అవుతోంది.";
            return "క్షమించండి, ఆ ఆదేశం నాకు అర్థం కాలేదు. దయచేసి మళ్ళీ చెప్పండి.";
        }

        // English Keywords
        if (q.includes('pothole') || q.includes('report'))
            return "Command Received. Initiating Pothole Reporting Sequence. Use the upload panel on the left.";
        if (q.includes('accident') || q.includes('zone') || q.includes('hotspot'))
            return "Analyzing Sector Data... 23 Critical Zones detected. Benz Circle is High Risk. Proceed with caution.";
        if (q.includes('emergency') || q.includes('help') || q.includes('police'))
            return "EMERGENCY PROTOCOL ACTIVATED. Dialing 108... Location coordinates shared with nearest response unit.";
        if (q.includes('scan') || q.includes('area'))
            return "Scanning Sector... Road surface quality: 68%. Traffic density: Moderate. No immediate threats detected.";
        if (q.includes('hello') || q.includes('hi'))
            return "Chitti Online. Awaiting Orders.";
        if (q.includes('download') || q.includes('data') || q.includes('file'))
            return "Compiling Mission Data... Initiating secure download sequence.";

        return "Command Not Recognized. Please restate query.";
    };

    return (
        <>
            {/* Floating Toggle Button (NetraOS Style) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-[2000] w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                    ${isOpen ? 'bg-red-500 rotate-45' : 'bg-cyan-500 hover:scale-110 animate-pulse-slow'}
                    shadow-[0_0_20px_rgba(6,182,212,0.6)] border-2 border-cyan-300
                `}
            >
                {isOpen ? <X size={24} className="text-black font-bold" /> : <Bot size={32} className="text-black" />}
            </button>

            {/* Chat Window (NetraOS HUD Style) */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-[2000] w-80 md:w-96 rounded-lg overflow-hidden border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)] animate-in slide-in-from-bottom-10 fade-in duration-300 flex flex-col font-mono"
                    style={{ height: '500px', backgroundColor: 'rgba(5, 10, 20, 0.95)', backdropFilter: 'blur(10px)' }}
                >
                    {/* HUD Header */}
                    <div className="bg-cyan-950/80 border-b border-cyan-500/50 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-cyan-500/20 flex items-center justify-center border border-cyan-400 relative">
                                <Bot size={18} className="text-cyan-400" />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_5px_#22d3ee]"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-cyan-400 text-sm tracking-widest">{lang === 'en' ? 'NETRA.OS v2.5' : 'రక్షక నేత్రం v2.5'}</h3>
                                <p className="text-cyan-700 text-[10px] flex items-center gap-1">
                                    <ActivityIcon /> {lang === 'en' ? 'SYSTEM OPTIMAL' : 'సిస్టమ్ సిద్ధంగా ఉంది'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setLang(lang === 'en' ? 'te' : 'en')}
                                className="flex items-center gap-1 px-2 py-1 bg-cyan-900/50 rounded border border-cyan-700 text-[10px] text-cyan-300 hover:bg-cyan-800 transition-colors"
                            >
                                <Globe size={12} /> {lang === 'en' ? 'TEL' : 'ENG'}
                            </button>
                            <Volume2 size={16} className="text-cyan-600 animate-pulse" />
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-20">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] px-4 py-2 text-xs leading-relaxed border
                                    ${msg.type === 'user'
                                        ? 'bg-cyan-900/40 border-cyan-600/50 text-cyan-100 rounded-tr-lg rounded-bl-lg'
                                        : 'bg-slate-900/60 border-slate-700 text-emerald-400 rounded-tl-lg rounded-br-lg shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                    }`}
                                >
                                    <div className="mb-1 opacity-50 text-[9px] uppercase tracking-wider">{msg.type === 'user' ? TRANSLATIONS[lang].operator : TRANSLATIONS[lang].chitti}</div>
                                    <div style={{ whiteSpace: 'pre-line' }}>{msg.type === 'bot' && <span className="mr-1">▌</span>}{msg.text}</div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <span className="text-cyan-500 text-xs animate-pulse">{TRANSLATIONS[lang].processing}</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="px-3 pb-2 grid grid-cols-2 gap-2">
                        {TRANSLATIONS[lang].suggestions.map((s, i) => (
                            <button key={i}
                                onClick={() => handleSend(s.cmd)}
                                className="flex items-center gap-2 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 text-cyan-400 hover:text-cyan-300 text-[10px] px-2 py-2 rounded transition-all uppercase tracking-wide group"
                            >
                                <s.icon size={12} className="group-hover:drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" /> {s.label}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-black/60 border-t border-cyan-900/50">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleListening}
                                className={`p-2 rounded border transition-all ${isListening ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-cyan-950/30 border-cyan-800 text-cyan-500 hover:bg-cyan-900/50'}`}
                            >
                                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                            </button>
                            <div className="flex-1 bg-cyan-950/20 border border-cyan-900/50 rounded flex items-center px-3 h-9 focus-within:border-cyan-500/50 transition-colors">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={isListening ? TRANSLATIONS[lang].micOn : TRANSLATIONS[lang].micOff}
                                    className="bg-transparent border-none outline-none text-cyan-100 text-xs flex-1 placeholder:text-cyan-800 font-mono w-full"
                                />
                            </div>
                            <button
                                onClick={() => handleSend()}
                                disabled={!inputValue.trim()}
                                className={`p-2 rounded border transition-all ${inputValue.trim() ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400 hover:bg-cyan-500/30' : 'bg-transparent border-transparent text-cyan-900'}`}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

const ActivityIcon = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
);
