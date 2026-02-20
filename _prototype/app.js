/* ══════════════════════════════════════════════════════════
   RAKSHAK SENTINEL — Application Logic
   ══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initClock();
  initUpload();
  initMap();
  initLetterEditor();
  initToolbar();
});

/* ─── LIVE CLOCK ─── */
function initClock() {
  const el = document.getElementById('live-clock');
  function tick() {
    const d = new Date();
    el.textContent = d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
  }
  tick();
  setInterval(tick, 1000);
}

/* ─── TOAST HELPER ─── */
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

/* ══════════════════════════════════════════
   POTHOLE DETECTION UPLOAD
   ══════════════════════════════════════════ */
function initUpload() {
  const zone = document.getElementById('upload-zone');
  const input = document.getElementById('file-input');
  const placeholder = document.getElementById('upload-placeholder');
  const canvasWrap = document.getElementById('canvas-wrapper');
  const canvas = document.getElementById('detection-canvas');
  const ctx = canvas.getContext('2d');
  const results = document.getElementById('detection-results');
  const reupload = document.getElementById('btn-reupload');

  // Click to upload
  placeholder.addEventListener('click', () => input.click());

  // Drag events
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) processImage(e.dataTransfer.files[0]);
  });

  input.addEventListener('change', () => {
    if (input.files.length) processImage(input.files[0]);
  });

  // Sample buttons
  document.querySelectorAll('.sample-btn').forEach(btn => {
    btn.addEventListener('click', () => loadSampleImage(btn.dataset.sample));
  });

  reupload.addEventListener('click', resetUpload);

  function resetUpload() {
    placeholder.style.display = '';
    canvasWrap.style.display = 'none';
    results.style.display = 'none';
    input.value = '';
  }

  function processImage(file) {
    if (!file.type.startsWith('image/')) {
      showToast('⚠️ Please upload an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => drawAndDetect(e.target.result);
    reader.readAsDataURL(file);
  }

  function loadSampleImage(id) {
    // Generate a synthetic road image on canvas
    drawSyntheticRoad(id);
  }

  function drawSyntheticRoad(id) {
    placeholder.style.display = 'none';
    canvasWrap.style.display = 'block';

    const w = canvasWrap.clientWidth || 500;
    const h = canvasWrap.clientHeight || 350;
    canvas.width = w; canvas.height = h;

    // Draw road
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#2c2c2c');
    grad.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Lane lines
    ctx.setLineDash([20, 15]);
    ctx.strokeStyle = '#ffb800';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.setLineDash([]);

    // Road edges
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(40, 0); ctx.lineTo(40, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w - 40, 0); ctx.lineTo(w - 40, h); ctx.stroke();

    // Add texture noise
    for (let i = 0; i < 200; i++) {
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 100 : 60},${Math.random() > 0.5 ? 100 : 60},${Math.random() > 0.5 ? 100 : 60},0.3)`;
      ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 3 + 1, Math.random() * 3 + 1);
    }

    // Add sample-specific potholes
    const configs = {
      '1': [
        { x: 120, y: 140, w: 90, h: 60, conf: 0.94, sev: 'High' },
        { x: 300, y: 250, w: 70, h: 50, conf: 0.87, sev: 'Medium' },
      ],
      '2': [
        { x: 80, y: 100, w: 110, h: 70, conf: 0.96, sev: 'Critical' },
        { x: 250, y: 180, w: 60, h: 45, conf: 0.82, sev: 'Medium' },
        { x: 350, y: 280, w: 80, h: 55, conf: 0.91, sev: 'High' },
      ],
      '3': [
        { x: 200, y: 120, w: 100, h: 65, conf: 0.89, sev: 'Medium' },
      ],
    };

    const potholes = configs[id] || configs['1'];

    // Draw pothole shapes (dark irregular patches)
    potholes.forEach(p => {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(p.x + p.w / 2, p.y + p.h / 2, p.w / 2, p.h / 2, Math.random() * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(20,15,10,0.7)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(80,60,40,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    });

    // Draw bounding boxes
    drawBoundingBoxes(potholes);
    showResults(potholes);
    showToast('🎯 AI Detection Complete — ' + potholes.length + ' pothole(s) found');
  }

  function drawAndDetect(dataUrl) {
    placeholder.style.display = 'none';
    canvasWrap.style.display = 'block';

    const img = new Image();
    img.onload = () => {
      const w = canvasWrap.clientWidth || 500;
      const ratio = img.width / img.height;
      const h = w / ratio;
      canvas.width = w; canvas.height = h;
      canvasWrap.style.height = h + 'px';
      ctx.drawImage(img, 0, 0, w, h);

      // Simulate detection
      const potholes = generateRandomDetections(w, h);
      drawBoundingBoxes(potholes);
      showResults(potholes);
      showToast('🎯 AI Detection Complete — ' + potholes.length + ' pothole(s) found');
    };
    img.src = dataUrl;
  }

  function generateRandomDetections(w, h) {
    const count = 3 + Math.floor(Math.random() * 4); // 3 to 6 objects
    const detections = [];

    for (let i = 0; i < count; i++) {
      const isVehicle = Math.random() > 0.5; // 50% chance
      const type = isVehicle ? 'Vehicle' : 'Pothole';

      // Sizes: Vehicles are larger
      const bw = isVehicle ? (100 + Math.random() * 120) : (40 + Math.random() * 60);
      const bh = isVehicle ? (60 + Math.random() * 80) : (30 + Math.random() * 50);

      detections.push({
        type: type,
        x: Math.random() * (w - bw - 20) + 10,
        y: Math.random() * (h - bh - 20) + 10,
        w: bw, h: bh,
        conf: (0.75 + Math.random() * 0.24),
        sev: isVehicle ? 'N/A' : ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)]
      });
    }
    return detections;
  }

  function drawBoundingBoxes(objects) {
    const overlay = document.getElementById('overlay-info');
    overlay.innerHTML = '';

    objects.forEach((obj, idx) => {
      // Color Logic: Red for Vehicles, Orange for Potholes
      let color = '#2ed573'; // Default Green
      if (obj.type === 'Vehicle') {
        color = '#ff3b30'; // Red
      } else if (obj.type === 'Pothole') {
        color = '#ff9f43'; // Orange
      }

      // Draw box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);

      // Background fill (transparent)
      ctx.fillStyle = color + '20'; // 20% opacity hex
      ctx.fillRect(obj.x, obj.y, obj.w, obj.h);

      // Label background
      ctx.fillStyle = color;
      const labelW = obj.type === 'Vehicle' ? 80 : 110;
      ctx.fillRect(obj.x, obj.y - 22, labelW, 22);

      // Label Text
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Inter, sans-serif';
      const labelText = obj.type === 'Vehicle' ? `Vehicle` : `Pothole ${(obj.conf * 100).toFixed(0)}%`;
      ctx.fillText(labelText, obj.x + 6, obj.y - 6);

      // Corner brackets
      const c = 10;
      ctx.beginPath(); ctx.moveTo(obj.x, obj.y + c); ctx.lineTo(obj.x, obj.y); ctx.lineTo(obj.x + c, obj.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(obj.x + obj.w - c, obj.y); ctx.lineTo(obj.x + obj.w, obj.y); ctx.lineTo(obj.x + obj.w, obj.y + c); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(obj.x, obj.y + obj.h - c); ctx.lineTo(obj.x, obj.y + obj.h); ctx.lineTo(obj.x + c, obj.y + obj.h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(obj.x + obj.w - c, obj.y + obj.h); ctx.lineTo(obj.x + obj.w, obj.y + obj.h); ctx.lineTo(obj.x + obj.w, obj.y + obj.h - c); ctx.stroke();
    });
  }

  function showResults(objects) {
    results.style.display = 'block';
    const cards = document.getElementById('result-cards');

    const vehicles = objects.filter(o => o.type === 'Vehicle');
    const potholes = objects.filter(o => o.type === 'Pothole');

    // Calculate Pothole Stats
    const avgConf = potholes.length > 0 ? potholes.reduce((s, p) => s + p.conf, 0) / potholes.length : 0;
    const maxSev = potholes.some(p => p.sev === 'Critical') ? 'Critical' :
      potholes.some(p => p.sev === 'High') ? 'High' :
        potholes.length > 0 ? 'Medium' : 'None';

    cards.innerHTML = `
      <div class="result-card-item" style="border-left: 3px solid #ff3b30">
        <div class="rc-value" style="color: #ff3b30">${vehicles.length}</div>
        <div class="rc-label">Vehicles</div>
      </div>
      <div class="result-card-item" style="border-left: 3px solid #ff9f43">
        <div class="rc-value" style="color: #ff9f43">${potholes.length}</div>
        <div class="rc-label">Potholes</div>
      </div>
      <div class="result-card-item">
        <div class="rc-value">${maxSev}</div>
        <div class="rc-label">Risk Level</div>
      </div>
    `;

    const sevVal = maxSev === 'Critical' ? 95 : maxSev === 'High' ? 75 : maxSev === 'Medium' ? 50 : 10;
    const bar = document.getElementById('severity-fill');
    bar.style.width = sevVal + '%';
    bar.style.background = `linear-gradient(90deg, #2ed573, ${maxSev === 'Critical' ? '#ff4757' : '#ff9f43'})`;

    document.getElementById('severity-label').textContent = `Road Status: ${vehicles.length} Vehicles • ${potholes.length} Defects`;
  }
}

/* ══════════════════════════════════════════
   ACCIDENT HEATMAP (Leaflet)
   ══════════════════════════════════════════ */
function initMap() {
  const map = L.map('leaflet-map', {
    zoomControl: false,
    attributionControl: false
  }).setView([17.385, 78.4867], 12);

  L.control.zoom({ position: 'topright' }).addTo(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
  }).addTo(map);

  // Accident data points for Hyderabad
  const accidentData = [
    [17.4399, 78.4983, 0.9], [17.4489, 78.3907, 0.8],
    [17.3616, 78.4747, 0.95], [17.3850, 78.4867, 0.7],
    [17.4156, 78.4347, 0.85], [17.3950, 78.5200, 0.6],
    [17.4260, 78.4580, 0.92], [17.3700, 78.5050, 0.75],
    [17.4100, 78.4700, 0.88], [17.4450, 78.5100, 0.65],
    [17.3580, 78.4400, 0.78], [17.4320, 78.3800, 0.82],
    [17.3900, 78.4100, 0.7], [17.4050, 78.5400, 0.6],
    [17.4600, 78.4200, 0.55], [17.3750, 78.4600, 0.93],
    [17.4180, 78.3950, 0.68], [17.3650, 78.5200, 0.72],
    [17.4350, 78.4450, 0.86], [17.3820, 78.3700, 0.77],
    [17.4500, 78.4650, 0.64], [17.3550, 78.4850, 0.91],
    [17.4220, 78.5050, 0.58],
  ];

  const heatLayer = L.heatLayer(accidentData, {
    radius: 30, blur: 25, maxZoom: 15,
    gradient: { 0.2: '#2ed573', 0.4: '#7bed9f', 0.6: '#ffb800', 0.8: '#ff6b35', 1.0: '#ff4757' }
  }).addTo(map);

  // Marker layer (hidden by default)
  const markerGroup = L.layerGroup();
  const customIcon = L.divIcon({
    html: '<div style="width:12px;height:12px;border-radius:50%;background:#ff4757;border:2px solid #fff;box-shadow:0 0 8px rgba(255,71,87,0.5);"></div>',
    iconSize: [12, 12], className: ''
  });
  accidentData.forEach(d => {
    L.marker([d[0], d[1]], { icon: customIcon })
      .bindPopup(`<b>Accident Hotspot</b><br>Severity: ${(d[2] * 100).toFixed(0)}%<br>Lat: ${d[0].toFixed(4)}, Lng: ${d[1].toFixed(4)}`)
      .addTo(markerGroup);
  });

  // Zone circles
  const zoneGroup = L.layerGroup();
  const zones = [
    { c: [17.4399, 78.4983], r: 800, label: 'Secunderabad' },
    { c: [17.3616, 78.4747], r: 700, label: 'Charminar' },
    { c: [17.4260, 78.4580], r: 600, label: 'Banjara Hills' },
    { c: [17.3750, 78.4600], r: 900, label: 'Mehdipatnam' },
    { c: [17.4489, 78.3907], r: 750, label: 'HITEC City' },
  ];
  zones.forEach(z => {
    L.circle(z.c, {
      radius: z.r, color: '#ffb800', fillColor: '#ffb800',
      fillOpacity: 0.1, weight: 1.5, dashArray: '6,4'
    }).bindPopup(`<b>${z.label}</b><br>High-risk zone`).addTo(zoneGroup);
  });

  // Layer toggle buttons
  const btnHeat = document.getElementById('btn-heat');
  const btnMarkers = document.getElementById('btn-markers');
  const btnZones = document.getElementById('btn-zones');

  function setActive(btn) {
    [btnHeat, btnMarkers, btnZones].forEach(b => {
      b.classList.remove('active', 'btn-amber');
      b.classList.add('btn-outline');
    });
    btn.classList.add('active', 'btn-amber');
    btn.classList.remove('btn-outline');
  }

  btnHeat.addEventListener('click', () => {
    setActive(btnHeat);
    map.removeLayer(markerGroup); map.removeLayer(zoneGroup);
    heatLayer.addTo(map);
  });
  btnMarkers.addEventListener('click', () => {
    setActive(btnMarkers);
    map.removeLayer(heatLayer); map.removeLayer(zoneGroup);
    markerGroup.addTo(map);
  });
  btnZones.addEventListener('click', () => {
    setActive(btnZones);
    map.removeLayer(heatLayer); map.removeLayer(markerGroup);
    zoneGroup.addTo(map);
  });
}

/* ══════════════════════════════════════════
   CIVIC LETTER EDITOR
   ══════════════════════════════════════════ */
const TEMPLATES = {
  pothole: {
    to: 'Municipal Commissioner',
    subject: 'Urgent: Pothole Repair Request',
    body: `<p><b>Subject: Urgent Request for Pothole Repair — Data-Driven Report</b></p>
<p>Respected Sir/Madam,</p>
<p>I am writing to bring to your urgent attention the dangerous road conditions at <b>[LOCATION]</b>, Ward <b>[WARD]</b>. Our AI-powered road safety analysis system, <b>Rakshak Sentinel</b>, has detected multiple severe potholes at this location through advanced computer vision analysis.</p>
<p><b>Key Findings:</b></p>
<ul>
<li>Number of potholes detected: <b>[COUNT]</b></li>
<li>Average severity: <b>High</b></li>
<li>Detection confidence: <b>94.2%</b></li>
<li>Risk assessment: <b>Immediate action required</b></li>
</ul>
<p>These potholes pose a significant risk to motorists, cyclists, and pedestrians, particularly during monsoon season when they become obscured by water accumulation. We have documented evidence including AI-analyzed imagery with bounding-box annotations.</p>
<p>We respectfully request immediate repair work at this location to prevent accidents and ensure public safety.</p>
<p>Yours faithfully,<br/>[YOUR NAME]<br/>Citizen Safety Advocate</p>`
  },
  accident: {
    to: 'Traffic Police Commissioner',
    subject: 'Accident Hotspot Report with AI Analysis',
    body: `<p><b>Subject: AI-Identified Accident Hotspot — Request for Safety Measures</b></p>
<p>Respected Sir/Madam,</p>
<p>Through our road safety AI platform <b>Rakshak Sentinel</b>, we have identified a critical accident hotspot at <b>[LOCATION]</b>, Ward <b>[WARD]</b>.</p>
<p><b>Heatmap Analysis Summary:</b></p>
<ul>
<li>Accident frequency: <b>Above 90th percentile</b></li>
<li>Time pattern: Peak incidents between <b>6 PM – 10 PM</b></li>
<li>Primary causes: Poor visibility, inadequate signage, road surface damage</li>
<li>Monthly trend: <b>+12% increase</b> over last quarter</li>
</ul>
<p><b>Recommended Actions:</b></p>
<ul>
<li>Installation of speed-breakers and warning signs</li>
<li>Improved street lighting</li>
<li>Deployment of traffic marshals during peak hours</li>
<li>Road resurfacing in damaged sections</li>
</ul>
<p>We are prepared to share detailed geospatial data and AI analysis reports to support your planning. This is a matter of public safety requiring urgent intervention.</p>
<p>Yours sincerely,<br/>[YOUR NAME]<br/>Road Safety Research Team</p>`
  },
  infrastructure: {
    to: 'Public Works Department',
    subject: 'Infrastructure Improvement Proposal',
    body: `<p><b>Subject: Data-Driven Infrastructure Improvement Proposal</b></p>
<p>Respected Sir/Madam,</p>
<p>Based on comprehensive analysis conducted by the <b>Rakshak Sentinel</b> AI platform, we are submitting a formal proposal for infrastructure improvements at <b>[LOCATION]</b>, Ward <b>[WARD]</b>.</p>
<p><b>Current Infrastructure Assessment:</b></p>
<ul>
<li>Road surface quality: <b>Below acceptable standards</b></li>
<li>Drainage adequacy: <b>Insufficient</b></li>
<li>Pedestrian safety features: <b>Missing or damaged</b></li>
<li>Street lighting coverage: <b>62% (target: 95%)</b></li>
</ul>
<p><b>Proposed Improvements:</b></p>
<ul>
<li>Complete road resurfacing with quality-grade asphalt</li>
<li>Installation of proper drainage systems</li>
<li>Addition of pedestrian crosswalks with reflective markings</li>
<li>LED street lighting installation</li>
<li>Guard rail installation at curves and elevated sections</li>
</ul>
<p>Our AI system continuously monitors road conditions and can provide ongoing assessment reports to track improvement progress.</p>
<p>Respectfully submitted,<br/>[YOUR NAME]<br/>Civic Infrastructure Advocate</p>`
  }
};

function initLetterEditor() {
  const editor = document.getElementById('letter-editor');
  const toField = document.getElementById('letter-to');
  const wardField = document.getElementById('letter-ward');
  const locField = document.getElementById('letter-location');

  // Load default template
  loadTemplate('pothole');

  // Template buttons
  document.querySelectorAll('.template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadTemplate(btn.dataset.template);
    });
  });

  function loadTemplate(key) {
    const t = TEMPLATES[key];
    toField.value = t.to;
    editor.innerHTML = t.body;
  }

  // AI Generate (fills in placeholders)
  document.getElementById('btn-generate').addEventListener('click', () => {
    let html = editor.innerHTML;
    const loc = locField.value || 'Main Road, City Center';
    const ward = wardField.value || 'Ward 15';
    html = html.replace(/\[LOCATION\]/g, loc);
    html = html.replace(/\[WARD\]/g, ward);
    html = html.replace(/\[COUNT\]/g, '3');
    html = html.replace(/\[YOUR NAME\]/g, 'Concerned Citizen');
    editor.innerHTML = html;
    showToast('✨ Letter generated with location data');
  });

  // Copy
  document.getElementById('btn-copy').addEventListener('click', () => {
    const text = editor.innerText;
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 Letter copied to clipboard');
    });
  });

  // Download as text
  document.getElementById('btn-download').addEventListener('click', () => {
    const text = editor.innerText;
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'civic_letter_rakshak.txt';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('📥 Letter downloaded');
  });

  // Print
  document.getElementById('btn-print').addEventListener('click', () => {
    const printArea = document.getElementById('print-area');
    printArea.innerHTML = `
      <div style="text-align:center;margin-bottom:30px;">
        <h1 style="font-size:18pt;color:#0a0e27;">RAKSHAK SENTINEL</h1>
        <p style="color:#666;font-size:10pt;">AI-Powered Road Safety — Civic Communication</p>
        <hr style="margin:15px 0;border:1px solid #ddd;"/>
      </div>
      <p><b>To:</b> ${toField.value}</p>
      <p><b>Ward/Zone:</b> ${wardField.value}</p>
      <p><b>Location:</b> ${locField.value}</p>
      <p><b>Date:</b> ${new Date().toLocaleDateString('en-IN')}</p>
      <hr style="margin:15px 0;border:1px solid #eee;"/>
      ${editor.innerHTML}
    `;
    window.print();
  });
}

/* ─── RICH TEXT TOOLBAR ─── */
function initToolbar() {
  document.querySelectorAll('.toolbar-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const cmd = btn.dataset.cmd;
      if (cmd) document.execCommand(cmd, false, null);
    });
  });
}
