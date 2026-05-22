const express = require('express');
const router = express.Router();
const pool = require('../db');

// Auto-migrate: add columns if missing
pool.query(`ALTER TABLE dress_entries ADD COLUMN IF NOT EXISTS wear_category VARCHAR(100)`).catch(() => {});
pool.query(`ALTER TABLE dress_entries ADD COLUMN IF NOT EXISTS last_name VARCHAR(100)`).catch(() => {});
pool.query(`ALTER TABLE dress_entries ADD COLUMN IF NOT EXISTS location VARCHAR(150)`).catch(() => {});
pool.query(`ALTER TABLE dress_entries ADD COLUMN IF NOT EXISTS pattern_type VARCHAR(100)`).catch(() => {});
pool.query(`ALTER TABLE dress_entries ADD COLUMN IF NOT EXISTS material VARCHAR(100)`).catch(() => {});
pool.query(`ALTER TABLE dress_entries ADD COLUMN IF NOT EXISTS app_name_suggestion VARCHAR(200)`).catch(() => {});

// Helper: count comma-separated or array values from a column
function countValues(rows, field, isArray = false) {
  const counts = {};
  rows.forEach(row => {
    let val = row[field];
    if (!val) return;
    let items = [];
    if (isArray) {
      items = Array.isArray(val) ? val : [];
    } else {
      items = String(val).split(',').map(v => v.trim()).filter(Boolean);
    }
    items.forEach(item => { counts[item] = (counts[item] || 0) + 1; });
  });
  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

// GET /api/entries/analytics — Aggregated demand stats
router.get('/analytics', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM dress_entries');
    res.json({
      success: true,
      total: rows.length,
      analytics: {
        category:     { label: 'Category (Wear)',    data: countValues(rows, 'wear_category') },
        dress_type:   { label: 'Dress Type',         data: countValues(rows, 'dress_type') },
        material:     { label: 'Material',           data: countValues(rows, 'material') },
        pattern_type: { label: 'Pattern Type',       data: countValues(rows, 'pattern_type') },
        dress_size:   { label: 'Dress Size',         data: countValues(rows, 'dress_size') },
        style:        { label: 'Preferred Style',    data: countValues(rows, 'preferred_styles', true) },
        color:        { label: 'Favourite Colors',   data: countValues(rows, 'favorite_colors') },
        budget:       { label: 'Budget Range',       data: countValues(rows, 'budget_range') },
        app_name:     { label: 'App Name Suggestions', data: countValues(rows, 'app_name_suggestion') },
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/entries — Submit a new form entry
router.post('/', async (req, res) => {
  const {
    full_name, last_name, email, phone, age,
    dress_type, dress_size, preferred_styles,
    favorite_colors, budget_range, wear_category, location,
    pattern_type, material, app_name_suggestion, notes,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO dress_entries
        (full_name, last_name, email, phone, age, dress_type, dress_size, preferred_styles, favorite_colors, budget_range, wear_category, location, pattern_type, material, app_name_suggestion, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [
        full_name, last_name || null, email,
        phone || null, age || null,
        dress_type || null, dress_size || null,
        preferred_styles || [],
        favorite_colors || null, budget_range || null,
        wear_category || null, location || null,
        pattern_type || null, material || null,
        app_name_suggestion || null, notes || null,
      ]
    );
    res.status(201).json({ success: true, entry: result.rows[0] });
  } catch (err) {
    console.error('Error inserting entry:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/entries — Get all entries (Admin)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM dress_entries ORDER BY created_at DESC'
    );
    res.json({ success: true, entries: result.rows });
  } catch (err) {
    console.error('Error fetching entries:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/entries/:id — Get single entry
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM dress_entries WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Entry not found' });
    }
    res.json({ success: true, entry: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/entries/:id — Update an entry (Admin)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    full_name, last_name, email, phone, age,
    dress_type, dress_size, preferred_styles,
    favorite_colors, budget_range, wear_category, location,
    pattern_type, material, app_name_suggestion, notes,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE dress_entries SET
        full_name = $1, last_name = $2, email = $3, phone = $4, age = $5,
        dress_type = $6, dress_size = $7, preferred_styles = $8,
        favorite_colors = $9, budget_range = $10,
        wear_category = $11, location = $12,
        pattern_type = $13, material = $14,
        app_name_suggestion = $15, notes = $16
       WHERE id = $17
       RETURNING *`,
      [
        full_name, last_name || null, email,
        phone || null, age || null,
        dress_type || null, dress_size || null,
        preferred_styles || [],
        favorite_colors || null, budget_range || null,
        wear_category || null, location || null,
        pattern_type || null, material || null,
        app_name_suggestion || null, notes || null,
        id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Entry not found' });
    }
    res.json({ success: true, entry: result.rows[0] });
  } catch (err) {
    console.error('Error updating entry:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/entries/:id — Delete an entry (Admin)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM dress_entries WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Entry not found' });
    }
    res.json({ success: true, message: 'Entry deleted successfully' });
  } catch (err) {
    console.error('Error deleting entry:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
