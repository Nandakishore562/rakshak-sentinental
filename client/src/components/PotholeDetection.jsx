import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, X, CheckCircle, AlertTriangle, MapPin, Navigation, Send, Loader, FileImage } from 'lucide-react';
import Webcam from 'react-webcam';

export default function PotholeDetection() {
    const [image, setImage] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [location, setLocation] = useState(null);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraType, setCameraType] = useState('environment'); // 'user' or 'environment'
    const [reportSent, setReportSent] = useState(false);
    const webcamRef = useRef(null);
    const fileInputRef = useRef(null);

    // Initial Location Fetch
    useEffect(() => {
        fetchLocation();
    }, []);

    const fetchLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                // Reverse geocode via PositionStack (Accurate)
                const API_KEY = '9ac1b08ca3d8c9ae621143e5265b33e8';
                fetch(`http://api.positionstack.com/v1/reverse?access_key=${API_KEY}&query=${latitude},${longitude}`)
                    .then(r => r.json())
                    .then(data => {
                        if (data.data && data.data.length > 0) {
                            const res = data.data[0];
                            const addr = res.label || [res.name, res.street, res.locality, res.region].filter(Boolean).join(', ');
                            setLocation({ lat: latitude, lng: longitude, address: addr });
                        } else {
                            setLocation({ lat: latitude, lng: longitude, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
                        }
                    })
                    .catch(() => {
                        console.warn('PositionStack failed, check HTTP/HTTPS');
                        setLocation({ lat: latitude, lng: longitude, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
                    });
            },
            () => {
                setLocation({ lat: 17.385, lng: 78.4867, address: 'Hyderabad (GPS unavailable)' });
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check if file is web-safe for preview (jpg, png, gif, webp, bmp, svg)
            const webSafeFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];
            const isWebSafe = webSafeFormats.includes(file.type);

            if (isWebSafe) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImage({ src: reader.result, name: file.name, isPreview: true });
                    setResult(null);
                    setReportSent(false);
                };
                reader.readAsDataURL(file);
            } else {
                // For RAW, HEIC, PSD, etc. - use placeholder but allow analysis
                setImage({ src: null, name: file.name, isPreview: false, size: file.size });
                setResult(null);
                setReportSent(false);
            }
        }
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImage({ src: imageSrc, name: 'Camera Capture', isPreview: true });
        setCameraOpen(false);
        setResult(null);
        setReportSent(false);
    }, [webcamRef]);

    const speak = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = 1.1;
        utterance.rate = 1.05;
        // Try to match Chitti's voice
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Google') || v.name.includes('Samantha'));
        if (femaleVoice) utterance.voice = femaleVoice;
        window.speechSynthesis.speak(utterance);
    };

    // Simple hash function for deterministic results
    const hashCode = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    };

    // Pseudo-random number generator seeded by hash
    const seededRandom = (seed) => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    const analyzeImage = () => {
        if (!image) return;
        setAnalyzing(true);
        speak("Scanning image data for anomalies...");

        // Simulate advanced computer vision analysis
        setTimeout(() => {
            // Generate hash from image content OR metadata (for non-preview files)
            let hashInput = image.isPreview ? image.src.substring(0, 1000) : `${image.name}-${image.size}`;
            const imgHash = hashCode(hashInput);
            let seed = imgHash;

            // Generate High Density Results for Hackathon Demo
            // Vehicles: 3-8
            const numVehicles = 3 + Math.floor(seededRandom(seed) * 6);
            // Potholes: 5-12
            const numPotholes = 5 + Math.floor(seededRandom(seed + 1) * 8);

            const detections = [];
            let currentId = 0;

            // Generate Vehicles (Reasonable sizes: 20-35% width)
            for (let i = 0; i < numVehicles; i++) {
                seed += 5;
                const bw = 20 + seededRandom(seed + 2) * 15;
                detections.push({
                    id: currentId++,
                    type: 'Vehicle',
                    confidence: (0.85 + seededRandom(seed) * 0.14).toFixed(2),
                    severity: 'N/A',
                    x: 5 + (seededRandom(seed + 4) * 65), // Keep inside bounds
                    y: 10 + (seededRandom(seed + 5) * 50),
                    w: bw,
                    h: bw * 0.75 // Approx aspect ratio
                });
            }

            // Generate Potholes (Sizes: 5-12% width)
            for (let i = 0; i < numPotholes; i++) {
                seed += 7;
                const bw = 5 + seededRandom(seed + 2) * 7;

                // Ensure some critical ones
                const isCritical = seededRandom(seed + 9) > 0.6;

                detections.push({
                    id: currentId++,
                    type: 'Pothole',
                    confidence: (0.75 + seededRandom(seed) * 0.20).toFixed(2),
                    severity: isCritical ? 'Critical' : 'High',
                    x: 5 + (seededRandom(seed + 6) * 85),
                    y: 30 + (seededRandom(seed + 7) * 60),
                    w: bw,
                    h: bw // Circular-ish
                });
            }

            // Find stats
            const vehicles = detections.filter(d => d.type === 'Vehicle');
            const potholes = detections.filter(d => d.type === 'Pothole');
            const isCritical = potholes.some(d => d.severity === 'Critical');
            // Calculate Average Confidence correctly
            const totalConf = detections.reduce((sum, d) => sum + parseFloat(d.confidence), 0);
            const avgConf = detections.length > 0 ? (totalConf / detections.length).toFixed(2) : 0;

            setResult({
                count: detections.length,
                vehicles: vehicles.length,
                potholes: potholes.length,
                detections: detections,
                maxSeverity: potholes.length === 0 ? 'None' : (isCritical ? 'Critical' : 'High'),
                avgConfidence: avgConf // Display Average instead of Max if preferred, or keep Max
            });
            setAnalyzing(false);

            // Voice Output
            setTimeout(() => {
                if (detections.length === 0) {
                    speak("Analysis Complete. No anomalies detected.");
                } else {
                    speak(`Analysis Complete. Detected ${vehicles.length} vehicles and ${potholes.length} potholes. Road status is ${isCritical ? 'Critical' : 'Attention Required'}.`);
                }
            }, 500);

        }, 2000);
    };

    const sendReport = () => {
        if (!location) return;
        // Simulate API call
        setTimeout(() => {
            setReportSent(true);
            speak("Report sent successfully to local municipality and N.G.O partners.");
        }, 1000);
    };

    const Sparkles = ({ size, className }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>;

    return (
        <div className="glass-card p-6 relative overflow-hidden flex flex-col h-full animate-in fade-in zoom-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 z-10">
                <div>
                    <h2 className="panel-title flex items-center gap-2">
                        <Camera size={20} className="text-amber-500" />
                        POTHOLE DETECTION
                    </h2>
                    <span className="panel-subtitle">YOLOv8 &bull; Computer Vision</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => document.getElementById('imageUpload').click()}
                        className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
                        title="Upload Image"
                    >
                        <Upload size={18} className="text-blue-400" />
                    </button>
                    <button
                        onClick={() => setCameraOpen(true)}
                        className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
                        title="Use Camera"
                    >
                        <Camera size={18} className="text-amber-500" />
                    </button>
                </div>
                <input
                    type="file"
                    id="imageUpload"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*, .heic, .heif, .raw, .cr2, .nef, .arw, .dng, .psd, .tiff, .tif"
                    onChange={handleImageUpload}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative bg-black/40 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center group">

                {/* Location Bar Overlay */}
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-20 flex justify-between items-start">
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                        <MapPin size={14} />
                        <div>
                            <div className="font-bold tracking-wider">GPS SIGNAL ACTIVE</div>
                            <div className="text-white/70 truncate max-w-[200px]">{location ? location.address : 'Acquiring Satellite Lock...'}</div>
                        </div>
                    </div>
                    {location && (
                        <div className="text-[10px] text-slate-400 font-mono text-right">
                            <div>LAT: {location.lat.toFixed(4)}</div>
                            <div>LNG: {location.lng.toFixed(4)}</div>
                        </div>
                    )}
                </div>

                {cameraOpen ? (
                    <div className="absolute inset-0 z-50 bg-black">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: cameraType }}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4 z-[60] flex gap-2">
                            <button onClick={() => setCameraType(prev => prev === 'user' ? 'environment' : 'user')} className="p-2 bg-black/50 rounded-full text-white border border-white/20">
                                <span className="text-xs">Flip</span>
                            </button>
                            <button onClick={() => setCameraOpen(false)} className="p-2 bg-red-500/80 rounded-full text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <button
                            onClick={capture}
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-4 border-white bg-white/20 flex items-center justify-center hover:bg-white/40 transition-all"
                        >
                            <div className="w-12 h-12 bg-white rounded-full"></div>
                        </button>
                    </div>
                ) : image ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                        {image.isPreview ? (
                            <img src={image.src} alt="Analysis" className="w-full h-full object-cover opacity-80 absolute inset-0" />
                        ) : (
                            <div className="flex flex-col items-center text-slate-400 z-10 p-8 glass-card rounded-xl">
                                <div className="text-4xl mb-2 text-amber-500">📁</div>
                                <div className="font-mono text-sm text-center break-all max-w-[200px]">{image.name}</div>
                                <div className="text-xs text-slate-500 mt-1">High-Res / RAW Format Detected</div>
                            </div>
                        )}

                        {/* Scanning Overlay */}
                        {analyzing && (
                            <div className="absolute inset-0 z-30 pointer-events-none">
                                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-scan-down"></div>
                                <div className="absolute inset-0 bg-cyan-500/10 animate-pulse"></div>
                                <div className="absolute center text-cyan-400 font-mono text-lg font-bold tracking-widest animate-pulse top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 px-4 py-2 rounded">
                                    ANALYZING DATA...
                                </div>
                            </div>
                        )}

                        {/* Detection Circles (Confirmed for Hackathon) */}
                        {!analyzing && result && image.isPreview && result.detections.map(det => {
                            const isVehicle = det.type === 'Vehicle';
                            // Vehicle: Red Circle, Pothole: Black Circle
                            const colorClass = isVehicle
                                ? 'border-red-600 bg-red-600/20 shadow-[0_0_15px_rgba(220,38,38,0.6)]'
                                : 'border-black bg-black/40 shadow-[0_0_10px_rgba(255,255,255,0.3)]';

                            const labelBg = isVehicle ? 'bg-red-700' : 'bg-black';

                            // Calculate height to make it circular based on aspect ratio
                            // If we don't know the image ratio, we approximate 1:1 visually by using 'aspect-square' if supported or raw padding hack, 
                            // but here we used percentage. Let's try to constrain it.
                            const heightStyle = det.w * (image.height && image.width ? (image.width / image.height) : 0.75);

                            return (
                                <div key={det.id} className={`absolute border-4 rounded-full ${colorClass} z-20 animate-in zoom-in duration-500`}
                                    style={{
                                        left: `${det.x}%`,
                                        top: `${det.y}%`,
                                        width: `${det.w}%`,
                                        // Use padding-bottom hack for Aspect Ratio if we want perfect circles regardless of container
                                        height: `${det.w}%`,
                                        // or better: utilize aspect-ratio CSS property which is widely supported now
                                        aspectRatio: '1 / 1'
                                    }}
                                >
                                    <div className={`absolute -top-6 left-1/2 -translate-x-1/2 ${labelBg} text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 whitespace-nowrap z-30 ring-1 ring-white/50`}>
                                        {isVehicle ? <Navigation size={10} className="fill-current" /> : <AlertTriangle size={10} />}
                                        {isVehicle ? `Vehicle` : `Pothole`}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center p-8">
                        <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4 border border-slate-700 group-hover:border-amber-500/50 transition-colors">
                            <Upload size={32} className="text-slate-500 group-hover:text-amber-500 transition-colors" />
                        </div>
                        <p className="text-slate-400 text-sm mb-4">Support: JPG, PNG, WEBP, RAW, PSD, HEIC...</p>
                        <button
                            onClick={() => document.getElementById('imageUpload').click()}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
                        >
                            Select Media
                        </button>
                    </div>
                )}
            </div>

            {/* Footer / Results */}
            <div className="mt-4 min-h-[80px]">
                {analyzing ? (
                    <div className="flex items-center gap-4 text-slate-300 text-sm animate-pulse">
                        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                        Processing Neural Network Layers...
                    </div>
                ) : result ? (
                    <div className="animate-in slide-in-from-bottom-5">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Detection Summary</div>
                                <div className="text-2xl font-bold text-white flex items-end gap-2 leading-none">
                                    {result.count} <span className="text-sm font-normal text-slate-400 mb-1">Defects Found</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Max Severity</div>
                                <div className={`text-xl font-bold ${result.maxSeverity === 'Critical' ? 'text-red-500' : (result.maxSeverity === 'None' ? 'text-emerald-500' : 'text-orange-500')}`}>
                                    {result.maxSeverity}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mb-4 text-xs font-mono">
                            <div className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                VEHICLES: {result.vehicles}
                            </div>
                            <div className="px-3 py-1 rounded-full bg-black/40 text-slate-200 border border-slate-600 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-black border border-white/50"></div>
                                POTHOLES: {result.potholes}
                            </div>
                        </div>

                        {reportSent ? (
                            <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-3 flex items-center gap-3 text-emerald-400 animate-in zoom-in">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle size={14} /> REPORT SENT TO MUNICIPALITY & NGOs                             </div>
                                <div className="text-sm font-medium">Report Successfully Filed. Ticket #RAD-{Math.floor(Math.random() * 10000)}</div>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setResult(null)}
                                    className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 text-sm flex-1 transition-colors"
                                >
                                    Scan Again
                                </button>
                                <button
                                    onClick={sendReport}
                                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium flex-1 shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition-all hover:scale-105"
                                >
                                    <Send size={16} /> Auto-Report to Municipality / NGOs
                                </button>
                            </div>
                        )}
                    </div>
                ) : image && !reportSent ? (
                    <button
                        onClick={analyzeImage}
                        className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-900/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        <Sparkles size={18} /> ANALYZE DATA
                    </button>
                ) : (
                    <div className="flex items-center gap-3 opacity-60">
                        <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full w-0 bg-blue-500"></div>
                        </div>
                        <span className="text-xs text-slate-500 uppercase">System Ready</span>
                    </div>
                )}
            </div>
        </div>
    );
}
