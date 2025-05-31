import express from 'express';
import fs from 'fs';
import cors from 'cors';
const app = express();
const PORT = 3001;
const DB_FILE = './bars.json';

app.use(cors());
app.use(express.json());

// Charger les bars depuis le fichier
function loadBars() {
    if (!fs.existsSync(DB_FILE)) return [];
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

// Sauvegarder les bars dans le fichier
function saveBars(bars) {
    fs.writeFileSync(DB_FILE, JSON.stringify(bars, null, 2));
}

// Récupérer tous les bars
app.get('/api/bars', (req, res) => {
    res.json(loadBars());
});

// Ajouter un bar
app.post('/api/bars', (req, res) => {
    const { name, price, lat, lng, user } = req.body;
    if (!name || !price || !lat || !lng || !user) {
        return res.status(400).json({ error: 'Champs manquants' });
    }
    const bars = loadBars();
    bars.push({ name, price, lat, lng, user });
    saveBars(bars);
    res.status(201).json({ success: true });
});

app.listen(PORT, () => {
    console.log(`API MaPinte démarrée sur http://localhost:${PORT}`);
});
