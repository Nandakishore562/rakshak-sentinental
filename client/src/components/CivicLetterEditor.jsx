import React, { useState } from 'react';
import { FileText, CircleAlert, Siren, HardHat, Sparkles, Copy, Download, Printer, List, ListOrdered, Send, CheckCircle } from 'lucide-react';

const TEMPLATES = {
    pothole: {
        to: 'Municipal Commissioner',
        body: `<p><b>Subject: Urgent Request for Pothole Repair — Data-Driven Report</b></p>
<p>Respected Sir/Madam,</p>
<p>I am writing to bring to your urgent attention the dangerous road conditions at <b>[LOCATION]</b>, Ward <b>[WARD]</b>. Our AI-powered road safety analysis system, <b>Rakshak Sentinel</b>, has detected multiple severe potholes through advanced computer vision.</p>
<p><b>Key Findings:</b></p>
<ul>
<li>Potholes detected: <b>[COUNT]</b></li>
<li>Average severity: <b>High</b></li>
<li>Detection confidence: <b>94.2%</b></li>
<li>Risk: <b>Immediate action required</b></li>
</ul>
<p>These potholes pose significant risk to all road users. We have documented evidence including AI-analyzed imagery.</p>
<p>We respectfully request immediate repair.</p>
<p>Yours faithfully,<br/>[YOUR NAME]</p>`
    },
    accident: {
        to: 'Traffic Police Commissioner',
        body: `<p><b>Subject: AI-Identified Accident Hotspot — Request for Safety Measures</b></p>
<p>Respected Sir/Madam,</p>
<p>Through <b>Rakshak Sentinel</b>, we have identified a critical accident hotspot at <b>[LOCATION]</b>, Ward <b>[WARD]</b>.</p>
<p><b>Analysis Summary:</b></p>
<ul>
<li>Frequency: <b>Above 90th percentile</b></li>
<li>Peak hours: <b>6 PM – 10 PM</b></li>
<li>Monthly trend: <b>+12% increase</b></li>
</ul>
<p><b>Recommendations:</b></p>
<ul>
<li>Speed-breakers and warning signs</li>
<li>Improved street lighting</li>
<li>Traffic marshals during peak hours</li>
</ul>
<p>Yours sincerely,<br/>[YOUR NAME]</p>`
    },
    infrastructure: {
        to: 'Public Works Department',
        body: `<p><b>Subject: Infrastructure Improvement Proposal</b></p>
<p>Respected Sir/Madam,</p>
<p>Based on analysis by <b>Rakshak Sentinel</b>, we submit a proposal for infrastructure improvements at <b>[LOCATION]</b>, Ward <b>[WARD]</b>.</p>
<p><b>Assessment:</b></p>
<ul>
<li>Road quality: <b>Below standards</b></li>
<li>Drainage: <b>Insufficient</b></li>
<li>Lighting: <b>62% coverage</b></li>
</ul>
<p><b>Proposed:</b></p>
<ul>
<li>Road resurfacing</li>
<li>Drainage systems</li>
<li>LED street lighting</li>
<li>Pedestrian crosswalks</li>
</ul>
<p>Respectfully,<br/>[YOUR NAME]</p>`
    }
};

export default function CivicLetterEditor() {
    const [template, setTemplate] = useState('pothole');
    const [formData, setFormData] = useState({ to: TEMPLATES.pothole.to, ward: '', location: '' });
    const [content, setContent] = useState(TEMPLATES.pothole.body);
    const [generated, setGenerated] = useState(false);
    const [copied, setCopied] = useState(false);

    const loadTemplate = (key) => {
        setTemplate(key);
        setFormData(prev => ({ ...prev, to: TEMPLATES[key].to }));
        setContent(TEMPLATES[key].body);
        setGenerated(false);
    };

    const generateAI = () => {
        let html = content;
        const loc = formData.location || 'Main Road, City Center';
        const ward = formData.ward || 'Ward 15';
        html = html.replace(/\[LOCATION\]/g, loc)
            .replace(/\[WARD\]/g, ward)
            .replace(/\[COUNT\]/g, '3')
            .replace(/\[YOUR NAME\]/g, 'Concerned Citizen');
        setContent(html);
        setGenerated(true);
    };

    const copyToClipboard = () => {
        const el = document.getElementById('editor-content');
        if (el) {
            navigator.clipboard.writeText(el.innerText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const downloadTxt = () => {
        const el = document.getElementById('editor-content');
        if (!el) return;
        const blob = new Blob([el.innerText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `rakshak_letter_${template}.txt`;
        a.click(); URL.revokeObjectURL(url);
    };

    return (
        <section className="glass-card glass-card-glow flex flex-col h-full">
            <div className="panel-header">
                <div className="panel-title-group">
                    <div className="panel-icon-wrapper green">
                        <FileText className="panel-icon green" />
                    </div>
                    <div>
                        <h2 className="panel-title">CIVIC LETTER</h2>
                        <span className="panel-subtitle">AI-Powered Generator</span>
                    </div>
                </div>
                <span className="badge badge-green-glow">
                    <Send size={10} /> TEMPLATES
                </span>
            </div>

            <div className="p-4 pb-2 space-y-3">
                {/* Template selector */}
                <div>
                    <label className="field-label">Select Template</label>
                    <div className="template-grid">
                        {[
                            { id: 'pothole', icon: CircleAlert, label: 'Pothole Report', color: '#ff4757' },
                            { id: 'accident', icon: Siren, label: 'Accident Alert', color: '#ff6b35' },
                            { id: 'infrastructure', icon: HardHat, label: 'Infrastructure', color: '#ffb800' }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => loadTemplate(t.id)}
                                className={`template-card ${template === t.id ? 'active' : ''}`}
                            >
                                <t.icon size={16} style={{ color: template === t.id ? t.color : undefined }} />
                                <span>{t.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form fields */}
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="field-label">To (Authority)</label>
                            <input type="text" className="field-input-enhanced" value={formData.to}
                                onChange={e => setFormData({ ...formData, to: e.target.value })} />
                        </div>
                        <div>
                            <label className="field-label">Ward / Zone</label>
                            <input type="text" className="field-input-enhanced" placeholder="e.g. Ward 42"
                                value={formData.ward} onChange={e => setFormData({ ...formData, ward: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="field-label">Location / Landmark</label>
                        <input type="text" className="field-input-enhanced" placeholder="e.g. Near City Hospital"
                            value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                    </div>
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 px-4 flex flex-col min-h-0">
                <label className="field-label mb-1">Letter Body</label>
                <div className="editor-toolbar-enhanced">
                    <button className="toolbar-btn-e" title="Bold"><b>B</b></button>
                    <button className="toolbar-btn-e" title="Italic"><i>I</i></button>
                    <button className="toolbar-btn-e" title="Underline"><u>U</u></button>
                    <div className="toolbar-divider"></div>
                    <button className="toolbar-btn-e"><List size={13} /></button>
                    <button className="toolbar-btn-e"><ListOrdered size={13} /></button>
                </div>
                <div
                    id="editor-content"
                    className="letter-editor-enhanced"
                    contentEditable
                    dangerouslySetInnerHTML={{ __html: content }}
                    onBlur={(e) => setContent(e.target.innerHTML)}
                ></div>
            </div>

            {/* Actions */}
            <div className="letter-actions">
                <button onClick={generateAI} className={`action-btn primary ${generated ? 'generated' : ''}`}>
                    {generated ? <><CheckCircle size={14} /> Generated!</> : <><Sparkles size={14} /> AI Generate</>}
                </button>
                <button onClick={copyToClipboard} className={`action-btn secondary ${copied ? 'copied' : ''}`}>
                    {copied ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                </button>
                <button onClick={downloadTxt} className="action-btn secondary">
                    <Download size={14} /> Download
                </button>
            </div>
        </section>
    );
}
