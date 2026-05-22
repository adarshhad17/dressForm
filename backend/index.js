const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const entriesRouter = require('./routes/entries');
const optionsRouter = require('./routes/options');

const app = express();
const PORT = process.env.PORT || 5000;

// Allow comma-separated origins in FRONTEND_URL
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,https://dressform-production.up.railway.app')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// API routes
app.use('/api/entries', entriesRouter);
app.use('/api/options', optionsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '🌸 Dress Form API is running!' });
});

// Serve frontend static build (unified hosting)
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
