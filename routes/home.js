const express = require('express');
const router = express.Router();
const path = require('path');

// Define a route for the home page
router.get('/', (req, res) => {
  // Render your home page HTML or send a file
  const filePath = 'home.html';
  
  res.sendFile(path.join(__dirname, '..', 'views', filePath), (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(500).send('Internal Server Error');
    }
  });
});

module.exports = router;
