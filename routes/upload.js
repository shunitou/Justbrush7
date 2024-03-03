const express = require('express');
const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const pool = require('../database');
const path = require('path');
const { Readable } = require('stream');
const router = express.Router();

// Configure AWS SDK with your credentials and region

const s3 = new S3Client({
  region: 'eu-west-3',
  credentials: {
    accessKeyId: 'AKIA2UC27ZDZXU2XVZOT',
    secretAccessKey: 'n27mh/fZ5RxluEOjP6PagzcwdIODcqUJM34U2m7m',
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
  const userId = req.user ? req.user.id : null;

  try {
    if (!userId) {
      throw new Error('User not authenticated');
    }

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

    await pool.query('INSERT INTO images (user_id, image_url) VALUES ($1, $2)', [userId, imageUrl]);

    res.send('Image uploaded successfully!');

    res.redirect('/');
  
  } catch (error) {
    console.error('Error uploading image:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
