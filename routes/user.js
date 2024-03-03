// routes/user.js
const express = require('express');
const router = express.Router();

router.get('/user', (req, res) => {
  // Check if the user is logged in
  if (req.isAuthenticated()) {
    res.json({ username: req.user.username });
  } else {
    res.json({ username: null });
  }
});

module.exports = router;
