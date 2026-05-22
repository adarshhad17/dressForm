const express = require('express');
const router = express.Router();
const db = require('../db');

// Default seed values — inserted if table is empty
const SEED = [
  { category: 'dress_type', value: 'Kurti' },
  { category: 'dress_type', value: 'Saree' },
  { category: 'dress_type', value: 'Lehenga' },
  { category: 'dress_type', value: 'Gown' },
  { category: 'dress_type', value: 'Anarkali' },
  { category: 'dress_type', value: 'Suit' },
  { category: 'dress_type', value: 'Salwar' },
  { category: 'dress_type', value: 'Tops' },
  { category: 'dress_type', value: 'Jeans' },
  { category: 'dress_type', value: 'Western Dress' },

  { category: 'dress_size', value: 'XS' },
  { category: 'dress_size', value: 'S' },
  { category: 'dress_size', value: 'M' },
  { category: 'dress_size', value: 'L' },
  { category: 'dress_size', value: 'XL' },
  { category: 'dress_size', value: 'XXL' },
  { category: 'dress_size', value: '2XL' },
  { category: 'dress_size', value: '3XL' },

  { category: 'style', value: 'Casual' },
  { category: 'style', value: 'Formal' },
  { category: 'style', value: 'Party' },
  { category: 'style', value: 'Ethnic' },
  { category: 'style', value: 'Western' },
  { category: 'style', value: 'Indo-Western' },

  { category: 'budget', value: 'Under ₹500' },
  { category: 'budget', value: '₹500 – ₹1,500' },
  { category: 'budget', value: '₹1,500 – ₹3,000' },
  { category: 'budget', value: '₹3,000+' },

  { category: 'wear_category', value: 'Daily Wear' },
  { category: 'wear_category', value: 'Office Wear' },
  { category: 'wear_category', value: 'Night Wear' },
  { category: 'wear_category', value: 'Casual Wear' },

  { category: 'color', value: 'Pink' },
  { category: 'color', value: 'Red' },
  { category: 'color', value: 'Blue' },
  { category: 'color', value: 'Green' },
  { category: 'color', value: 'Yellow' },
  { category: 'color', value: 'White' },
  { category: 'color', value: 'Black' },
  { category: 'color', value: 'Orange' },
  { category: 'color', value: 'Purple' },
  { category: 'color', value: 'Maroon' },

  { category: 'pattern_type', value: 'Solid' },
  { category: 'pattern_type', value: 'Checked' },
  { category: 'pattern_type', value: 'Printed' },
  { category: 'pattern_type', value: 'Small Printed' },
  { category: 'pattern_type', value: 'Striped' },
  { category: 'pattern_type', value: 'Floral' },
  { category: 'pattern_type', value: 'Embroidered' },

  { category: 'material', value: 'Cotton' },
  { category: 'material', value: 'Silk' },
  { category: 'material', value: 'Polyester' },
  { category: 'material', value: 'Linen' },
  { category: 'material', value: 'Georgette' },
  { category: 'material', value: 'Chiffon' },
  { category: 'material', value: 'Rayon' },
  { category: 'material', value: 'Denim' },
];

// Create table + seed on startup
async function initOptions() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS form_options (
      id SERIAL PRIMARY KEY,
      category VARCHAR(50) NOT NULL,
      value VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  const { rows } = await db.query('SELECT COUNT(*) FROM form_options');
  if (parseInt(rows[0].count) === 0) {
    for (const { category, value } of SEED) {
      await db.query(
        'INSERT INTO form_options (category, value) VALUES ($1, $2)',
        [category, value]
      );
    }
    console.log('✅ form_options seeded with defaults');
  }
}

initOptions().catch(console.error);

// GET /api/options — all options grouped by category
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM form_options ORDER BY category, id'
    );
    const grouped = rows.reduce((acc, row) => {
      if (!acc[row.category]) acc[row.category] = [];
      acc[row.category].push({ id: row.id, value: row.value });
      return acc;
    }, {});
    res.json({ options: grouped });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch options' });
  }
});

// POST /api/options — add a new option
router.post('/', async (req, res) => {
  const { category, value } = req.body;
  if (!category || !value?.trim()) {
    return res.status(400).json({ error: 'category and value are required' });
  }
  const validCategories = ['dress_type', 'dress_size', 'style', 'budget', 'wear_category', 'color', 'pattern_type', 'material'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  try {
    const { rows } = await db.query(
      'INSERT INTO form_options (category, value) VALUES ($1, $2) RETURNING *',
      [category, value.trim()]
    );
    res.status(201).json({ option: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add option' });
  }
});

// DELETE /api/options/:id — remove an option
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'DELETE FROM form_options WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Option not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete option' });
  }
});

module.exports = router;
