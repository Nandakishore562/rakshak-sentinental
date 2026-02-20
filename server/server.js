import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Mock Data
const ACCIDENTS = [
    { lat: 17.4399, lng: 78.4983, severity: 0.9 },
    { lat: 17.4489, lng: 78.3907, severity: 0.8 },
    // ... (could serve full list here)
];

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', system: 'Rakshak Sentinel v2.1.0' });
});

app.get('/api/accidents', (req, res) => {
    res.json(ACCIDENTS);
});

// Mock upload handler
const upload = multer({ dest: 'uploads/' });
app.post('/api/detect', upload.single('image'), (req, res) => {
    // Simulate AI processing delay
    setTimeout(() => {
        res.json({
            success: true,
            detections: [
                { class: 'pothole', confidence: 0.94, bbox: [100, 100, 200, 200] }
            ]
        });
    }, 1500);
});

app.listen(PORT, () => {
    console.log(`Rakshak Sentinel Server running on http://localhost:${PORT}`);
});
