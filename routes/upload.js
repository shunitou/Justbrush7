const express = require('express');
const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const pool = require('../database');
const path = require('path');
const { Readable } = require('stream');
const router = express.Router();
require('dotenv').config();
// Configure AWS SDK with your credentials and region

const s3 = new S3Client({
  region: 'eu-west-3',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, callback) => {
    if (file.mimetype.startsWith('image/')) {
      callback(null, true);
    } else {
      callback(new Error('Uploaded file is not an image'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.get('/upload', (req, res) => {
  const filePath = 'upload.html';
  res.sendFile(path.join(__dirname, '..', 'views', filePath));
});

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Ensure the user is authenticated
    if (!req.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    const userId = req.user.id;
    const username = req.user.username; // Adjust this based on your user object structure

    if (!req.file) {
      throw new Error('No image file provided');
    }

    const params = {
      Bucket: 'justbrushimage',
      Key: `${userId}_${Date.now()}_${req.file.originalname}`,
      Body: Readable.from(req.file.buffer),
      ContentType: req.file.mimetype,
    };

    const upload = new Upload({
      client: s3,
      params,
    });

    const uploadResult = await upload.done();
    const imageUrl = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;

    await pool.query('INSERT INTO images (user_id, username, image_url) VALUES ($1, $2, $3)', [userId, username, imageUrl]);

    // Send a success response
    res.send({ success: true, message: 'Image uploaded successfully!', username });
  
  } catch (error) {
    console.error('Error uploading image:', error.message);
    // Send an error response
    res.status(500).json({ success: false, error: error.message });
  }
});
module.exports = router;
