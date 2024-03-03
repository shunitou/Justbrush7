// helpers/points-helper.js
const pool = require('../database');

async function rewardUserWithPoints(username, rewardAmount) {
  try {
    // Use ON CONFLICT to insert a new row if the user does not exist
    await pool.query(`
      INSERT INTO points (username, points)
      VALUES ($1, $2)
      ON CONFLICT (username)
      DO UPDATE SET points = points.points + $2;
    `, [username, rewardAmount]);

    console.log(`Successfully rewarded ${rewardAmount} points to user: ${username}`);
  } catch (error) {
    console.error('Error rewarding points to user:', error.message);
    throw error; // Rethrow the error for further handling
  }
}

module.exports = {
  rewardUserWithPoints,
};