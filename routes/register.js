const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../database');
const path = require('path');
const { Wallet } = require('ethers');

const router = express.Router();

router.get('/register', (req, res) => {
  const role = req.query.role || 'normal';
  const filePath = role === 'special' ? 'registerSpecial.html' : 'registerNormal.html';
  res.sendFile(path.join(__dirname, '..', 'views', filePath));
});

router.post('/register', async (req, res) => {
  const { username, wallet, password, registrationCode, role } = req.body;
  const isSpecialUser = role === 'special' && registrationCode === 'specialCode';
  const hashedPassword = await bcrypt.hash(password, 10);
  

  try {
    // Check for duplicate username
    const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).send('Username already exists.');
    }

    // Insert the new user
    const result = await pool.query('INSERT INTO users (username, wallet, password, role) VALUES ($1, $2, $3, $4) RETURNING id', [username, wallet, hashedPassword, isSpecialUser ? 'special' : 'normal']);
    const userId = result.rows[0].id;

    res.redirect(`/upload?userId=${userId}`);
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
