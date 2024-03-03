// routes/logout.js
const express = require('express');
const router = express.Router();

router.get('/logout', (req, res) => {
  // Perform any necessary cleanup or additional actions before logging out
  req.logout();
  res.redirect('/'); // Redirect to home.html after logout
});

module.exports = router;
