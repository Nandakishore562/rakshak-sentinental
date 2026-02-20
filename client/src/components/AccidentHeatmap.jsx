import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { MapPin, AlertTriangle, TrendingUp, Activity, Clock, Layers, Navigation, PieChart } from 'lucide-react';
import LocationAnalytics from './LocationAnalytics';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ACCIDENT_DATA = [
    { lat: 16.5062, lng: 80.6480, sev: 0.95, label: 'Benz Circle', incidents: 52 },
    { lat: 16.5193, lng: 80.6115, sev: 0.8, label: 'Pundit Nehru Bus Station', incidents: 47 },
    { lat: 16.5100, lng: 80.6450, sev: 0.9, label: 'MG Road (Bandar Rd)', incidents: 38 },
    { lat: 16.5449, lng: 80.6120, sev: 0.7, label: 'Bhavanipuram', incidents: 28 },
    { lat: 16.4980, lng: 80.6800, sev: 0.85, label: 'Autonagar Junction', incidents: 34 },
    { lat: 16.5250, lng: 80.6200, sev: 0.6, label: 'Governorpet', incidents: 22 },
    { lat: 16.5150, lng: 80.6600, sev: 0.92, label: 'Patamata', incidents: 41 },
    { lat: 16.5300, lng: 80.5900, sev: 0.75, label: 'Gollapudi', incidents: 30 },
    { lat: 16.4800, lng: 80.6600, sev: 0.88, label: 'Kanuru', incidents: 25 },
    { lat: 16.5500, lng: 80.6400, sev: 0.65, label: 'Gunadala', incidents: 19 },
    { lat: 16.5130, lng: 80.6850, sev: 0.82, label: 'Ramavarappadu Ring', incidents: 44 },
    { lat: 16.5000, lng: 80.6300, sev: 0.78, label: 'Labbipet', incidents: 26 },
    { lat: 16.4900, lng: 80.6000, sev: 0.72, label: 'Krishnalanka', incidents: 31 },
    { lat: 16.5600, lng: 80.6500, sev: 0.6, label: 'Nunna', incidents: 15 },
    { lat: 16.5050, lng: 80.6480, sev: 0.96, label: 'Benz Circle Flyover', incidents: 29 },
];

const ZONES = [
    { c: [16.5062, 80.6480], r: 900, label: 'Benz Circle', risk: 'Critical' },
    { c: [16.5193, 80.6115], r: 800, label: 'Bus Station Area', risk: 'High' },
    { c: [16.4980, 80.6800], r: 700, label: 'Autonagar', risk: 'High' },
    { c: [16.5130, 80.6850], r: 850, label: 'Ramavarappadu', risk: 'Critical' },
    { c: [16.5449, 80.6120], r: 600, label: 'Bhavanipuram', risk: 'Medium' },
];

function HeatmapLayer({ points }) {
    const map = useMap();
    useEffect(() => {
        const heat = L.heatLayer(
            points.map(p => [p.lat, p.lng, p.sev]),
            {
                radius: 35, blur: 25, maxZoom: 15, minOpacity: 0.4,
                gradient: { 0.2: '#2ed573', 0.4: '#7bed9f', 0.6: '#ffc933', 0.8: '#ff6b35', 1.0: '#ff4757' }
            }
        );
        heat.addTo(map);
        return () => map.removeLayer(heat);
    }, [map, points]);
    return null;
}

function getSevColor(sev) {
    if (sev >= 0.9) return '#ff4757';
    if (sev >= 0.7) return '#ff6b35';
    if (sev >= 0.5) return '#ffb800';
    return '#2ed573';
}

function CustomMarkers({ data, onSelect }) {
    const map = useMap();
    useEffect(() => {
        const markers = data.map(p => {
            const icon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="
          width:14px;height:14px;border-radius:50%;
          background:${getSevColor(p.sev)};
          box-shadow:0 0 12px ${getSevColor(p.sev)}80, 0 0 24px ${getSevColor(p.sev)}40;
          border:2px solid rgba(255,255,255,0.6);
          animation: markerPulse 2s ease-in-out infinite;
        "></div>`,
                iconSize: [14, 14], iconAnchor: [7, 7],
            });
            const m = L.marker([p.lat, p.lng], { icon });
            m.bindPopup(`
        <div style="font-family:Inter,sans-serif;padding:4px;min-width:160px">
          <div style="font-weight:700;color:#ffb800;font-size:13px;margin-bottom:4px">${p.label}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px">
            <div><span style="color:#94a3b8">Severity:</span> <b style="color:${getSevColor(p.sev)}">${(p.sev * 100).toFixed(0)}%</b></div>
            <div><span style="color:#94a3b8">Incidents:</span> <b style="color:#ffc933">${p.incidents}</b></div>
          </div>
        </div>
      `, { className: 'custom-popup' });
            m.addTo(map);
            return m;
        });
        return () => markers.forEach(m => map.removeLayer(m));
    }, [map, data]);
    return null;
}

export default function AccidentHeatmap() {
    const [activeLayer, setActiveLayer] = useState('heat');
    const [totalIncidents] = useState(ACCIDENT_DATA.reduce((a, b) => a + b.incidents, 0));
    const [showAnalytics, setShowAnalytics] = useState(false);

    return (
        <section className="glass-card glass-card-glow flex flex-col h-full col-span-2-lg relative">
            {/* Header */}
            <div className="panel-header">
                <div className="panel-title-group">
                    <div className="panel-icon-wrapper">
                        <MapPin className="panel-icon" />
                    </div>
                    <div>
                        <h2 className="panel-title">ACCIDENT HEATMAP</h2>
                        <span className="panel-subtitle">Vijayawada Metropolitan Region</span>
                    </div>
                </div>
                {/* ... (Buttons remain same) */}
                <div className="flex gap-1.5 align-center">
                    <button
                        onClick={() => setShowAnalytics(true)}
                        className="layer-btn"
                        style={{ border: '1px solid rgba(255,184,0,0.3)', color: '#fbbf24' }}
                    >
                        <PieChart size={12} /> Analytics
                    </button>
                    <div className="w-[1px] h-4 bg-white/10 mx-1 self-center"></div>
                    {[
                        { id: 'heat', label: 'Heatmap', icon: '🔥' },
                        { id: 'markers', label: 'Markers', icon: '📍' },
                        { id: 'zones', label: 'Zones', icon: '🔶' }
                    ].map(layer => (
                        <button
                            key={layer.id}
                            onClick={() => setActiveLayer(layer.id)}
                            className={`layer-btn ${activeLayer === layer.id ? 'active' : ''}`}
                        >
                            <span>{layer.icon}</span> {layer.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Map */}
            <div className="map-wrapper">
                <MapContainer
                    center={[16.5062, 80.6480]}
                    zoom={13}
                    style={{ height: '100%', width: '100%', borderRadius: '10px' }}
                    zoomControl={false}
                    attributionControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; CartoDB'
                    />

                    {activeLayer === 'heat' && <HeatmapLayer points={ACCIDENT_DATA} />}
                    {activeLayer === 'markers' && <CustomMarkers data={ACCIDENT_DATA} />}
                    {activeLayer === 'zones' && ZONES.map((z, i) => (
                        <Circle

                            key={i}
                            center={z.c}
                            radius={z.r}
                            pathOptions={{
                                color: z.risk === 'Critical' ? '#ff4757' : z.risk === 'High' ? '#ff6b35' : '#ffb800',
                                fillColor: z.risk === 'Critical' ? '#ff4757' : z.risk === 'High' ? '#ff6b35' : '#ffb800',
                                fillOpacity: 0.08,
                                weight: 2,
                                dashArray: '8,4'
                            }}
                        >
                            <Popup className="custom-popup">
                                <b style={{ color: '#ffb800' }}>{z.label}</b><br />
                                <span style={{ color: getSevColor(z.risk === 'Critical' ? 0.95 : z.risk === 'High' ? 0.8 : 0.6) }}>
                                    ● {z.risk} Risk Zone
                                </span>
                            </Popup>
                        </Circle>
                    ))}
                </MapContainer>

                {/* Legend overlay */}
                <div className="map-legend-overlay">
                    <div className="legend-title">
                        <Layers size={12} /> Accident Frequency
                    </div>
                    <div className="legend-bar">
                        <span className="legend-label low">Low</span>
                        <div className="legend-gradient"></div>
                        <span className="legend-label high">Critical</span>
                    </div>
                </div>

                {/* Live indicator */}
                <div className="map-live-indicator">
                    <span className="live-dot"></span> LIVE FEED
                </div>

                {/* Analytics Modal Overlay */}
                {showAnalytics && (
                    <div className="absolute inset-2 z-[1000]">
                        <LocationAnalytics locationName="Vijayawada Metropolitan" onClose={() => setShowAnalytics(false)} />
                    </div>
                )}
            </div>

            {/* Stats strip */}
            <div className="stats-strip">
                <StatChip icon={AlertTriangle} value="23" label="Hotspots" color="#ff4757" />
                <StatChip icon={TrendingUp} value="+12%" label="This Month" color="#ff6b35" />
                <StatChip icon={Activity} value={String(totalIncidents)} label="Total Incidents" color="#ffb800" />
                <StatChip icon={Navigation} value="18" label="Active Zones" color="#3b82f6" />
                <StatChip icon={Clock} value="2m ago" label="Last Update" color="#94a3b8" />
            </div>
        </section>
    );
}

function StatChip({ icon: Icon, label, value, color }) {
    return (
        <div className="stat-chip-enhanced">
            <Icon size={13} style={{ color }} />
            <strong style={{ color }}>{value}</strong>
            <span>{label}</span>
        </div>
    );
}
