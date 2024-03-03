const express = require('express');
const pool = require('../database');
const path = require('path');
const router = express.Router();

router.get('/points', async (req, res) => {
  const username = req.user ? req.user.username : null;

  try {
    const result = await pool.query('SELECT points FROM points WHERE username = $1', [username]);

    if (result.rows.length > 0) {
      const userPoints = result.rows.reduce((total, row) => total + row.points, 0);
      res.render('points', { userPoints });
    } else {
      res.status(404).json({ error: 'User not found or no points available' });
    }
  } catch (error) {
    console.error('Error retrieving points:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;