const multer = require('multer');
const fs = require('fs');
const path = require('path');
const multerUtils = require('../../utils/multer/multer-utils');

// Storage configuration for multer
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../../public/excelUploads'); // Ensure path is correct
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // Create directory if it doesn't exist
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    try {
      cb(null, file.originalname); // Use original file name
    } catch (error) {
      cb(error, null);
    }
  },
});

const excelUploads = multer({
  storage: multerStorage,
  limits: { fileSize: multerUtils?.MULTER_UPLOAD_FILE_SIZE_LIMIT },
  fileFilter: multerUtils?.fileTypeFilterForExcel,
});
module.exports = excelUploads;
