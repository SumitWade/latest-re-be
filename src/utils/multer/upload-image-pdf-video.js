const multer = require('multer');
const fs = require('fs');
const uniqId = require('short-unique-id');
const uid = new uniqId();
const multerUtils = require('../../utils/multer/multer-utils');
const path = require("path")

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
      const uploadPath = path.join("public", "document", req.folderName );
      if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
  },
  //save file name as original name
  filename: function (req, file, cb) {
    try {
      const extension = file.mimetype.split('/')[1];
      const filename = `${uid.stamp(10)}.${extension}`;
      cb(null, filename);
    } catch (error) {
      cb(error, null);
    }
  },
});

const uploadImageVideoPdfImages = multer({
  storage: multerStorage,
  fileFilter: multerUtils?.multerFileTypeFilterForImagePdfVideo,
});
module.exports = uploadImageVideoPdfImages;
