const multer = require('multer');

//middleware to handle multer error
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof multer.MulterError) {
        if (result.code === 'LIMIT_FILE_COUNT') {
          res.statusCode === 200;
          return res.json({
            status: 'FAILED',
            message: 'Too many files selected',
          });
        }

        if (result.code === 'LIMIT_FILE_SIZE') {
          res.statusCode === 200;
          return res.json({
            status: 'FAILED',
            message: `File size exceeds the limit, Please check the file`,
          });
        }

        if (result.code === 'FILE_SIZE_ZERO') {
          res.statusCode === 200;
          return res.json({
            status: 'FAILED',
            message: 'File not selected / file size equals to zero ',
          });
        }

        if (result.code === 'ONLY_IMAGE_AND_PDF_ALLOWED') {
          res.statusCode === 200;
          res.json({
            status: 'FAILED',
            message: 'Only Image and pdf are allowed',
          });
          return;
        }

        if (result.code === 'ONLY_IMAGE_ALLOWED') {
          res.statusCode === 200;
          res.json({
            status: 'FAILED',
            message: 'Only Image are allowed',
          });
          return;
        }
        return reject(result);
      }
      return resolve(result);
    });
  });
};

module.exports = runMiddleware;
