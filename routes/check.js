// routes/check.js
const express = require('express');
const pool = require('../database');
const pointsHelper = require('../helpers/points-helper');
const router = express.Router();

async function getImagesForSpecialUser(username) {
  // Your logic to retrieve normal user images based on a filter
  // This can be a database query or any other method you use
  // Return an array of images
  return [];
}

async function checkSpecialUser(req, res, next) {
  try {
    // Ensure the user is authenticated
    if (!req.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    // Fetch user details from the database
    const result = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.id]);

    // Ensure the user exists in the database
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    // Get the user's role from the database result
    const userRole = result.rows[0].role;

    // Log the user's role (optional)
    console.log('User Role:', userRole);

    // Add the userRole to res.locals to make it available in the EJS template
    res.locals.userRole = userRole;

    // Check if the user has the 'special' role
    if (userRole === 'special') {
      return next();
    } else {
      throw new Error('Insufficient permissions');
    }
  } catch (error) {
    console.error('Error in checkSpecialUser middleware:', error.message);
    res.status(403).send(`Forbidden: ${error.message}`);
  }
}

router.post('/reward', checkSpecialUser, async (req, res) => {
  const username = req.body.username; // Use req.body.username to get the username
  const rewardAmount = req.body.rewardAmount;

  try {
    await pointsHelper.rewardUserWithPoints(username, rewardAmount);
    res.redirect('/check');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/check', checkSpecialUser, async (req, res) => {
  try {
    // Fetch all usernames from the database
    const usernamesResult = await pool.query('SELECT DISTINCT username FROM images');

    // Extract the usernames from the database result
    const usernames = usernamesResult.rows.map(row => row.username);

    // Get the selected username from the query parameters
    const selectedUsername = req.query.username || '';

    // Fetch image_data from the database based on the selected username
    const imagesResult = await pool.query('SELECT image_url, username FROM images WHERE username = $1', [selectedUsername]);

    // Extract the image data from the database result
    const images = imagesResult.rows;

    // Render the 'check' EJS template with the fetched data
    res.render('check', { usernames, images, selectedUsername, searchPerformed: true });
  } catch (error) {
    console.error('Error in /check route:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;