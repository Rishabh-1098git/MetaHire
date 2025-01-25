const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Load environment variables from .env file
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Your Cloudinary Cloud Name
  api_key: process.env.CLOUDINARY_API_KEY,      // Your Cloudinary API Key
  api_secret: process.env.CLOUDINARY_API_SECRET // Your Cloudinary API Secret
});

// Storage for photos
const photoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'user_photos', // Folder where photos will be stored in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'], // Allowed file formats for photos
  },
});

// Storage for resumes
const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'user_resumes', // Folder where resumes will be stored in Cloudinary
    allowed_formats: ['pdf', 'doc', 'docx'], // Allowed file formats for resumes
  },
});

// Export both storages
module.exports = { photoStorage, resumeStorage };
