const express = require('express');
const router = express.Router();
const { uploadPhoto, uploadResume } = require('../multerConfig');


router.post('/upload-photo', uploadPhoto.single('photo'), (req, res) => {
  try {
    res.status(200).json({ message: 'Photo uploaded successfully', url: req.file.path });
  } catch (error) {
    res.status(500).json({ message: 'Photo upload failed', error });
  }
});


router.post('/upload-resume', uploadResume.single('resume'), (req, res) => {
  try {
    res.status(200).json({ message: 'Resume uploaded successfully', url: req.file.path });
  } catch (error) {
    res.status(500).json({ message: 'Resume upload failed', error });
  }
});

module.exports = router;
