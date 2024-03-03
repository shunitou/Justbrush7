// routes/login.js
const express = require('express');
const passport = require('passport');
const router = express.Router();
const path = require('path');

router.get('/login', (req, res) => {
  const filePath = 'login.html';
  res.sendFile(path.join(__dirname, '..', 'views', filePath));
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',  // Redirect to dashboard on successful login
  failureRedirect: '/login',      // Redirect back to login page on failure
  failureFlash: true,
}), (req, res) => {
  // Log the user's role after successful login
  console.log('User Role after login:', req.session.userRole);
});

module.exports = router;