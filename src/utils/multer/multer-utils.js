// File Size
const fileSize = Number(process.env.FILE_SIZE) ?? 2000000; //2MB

// video size
const videoSize = Number(process.env.VIDEO_SIZE) ?? 500000000; //20MB

//check multer upload file size
module.exports.MULTER_UPLOAD_FILE_SIZE_LIMIT = fileSize;

//check multer upload video size
module.exports.MULTER_UPLOAD_VIDEO_SIZE_LIMIT = videoSize;

//check multer file type jpeg, jpg, png or not
module.exports.multerFileTypeImage = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
    // check for extension also
    const extension = file.originalname.split('.').pop().toLowerCase(); // this will give last element
    // check for if extension allowed
    if (['jpeg', 'jpg', 'png'].includes(extension)) {
      cb(null, true);
    } else {
      cb({ code: 'ONLY_IMAGE_ALLOWED' }, false);
    }
  } else {
    cb({ code: 'ONLY_IMAGE_ALLOWED' }, false);
  }
};

//check multer file type jpeg, jpg, png, pdf or not
module.exports.multerFileTypeFilterForPdfJpgAndPng = (req, file, cb) => {
  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/png'
  ) {
    // check for extension also
    const extension = file.originalname.split('.').pop().toLowerCase(); // this will give last element

    // check for if extension allowed
    if (['pdf', 'jpeg', 'jpg', 'png'].includes(extension)) {
      cb(null, true);
    } else {
      cb({ code: 'ONLY_IMAGE_AND_PDF_ALLOWED' }, false);
    }
  } else {
    cb({ code: 'ONLY_IMAGE_AND_PDF_ALLOWED' }, false);
  }
};

//check multer file type mp3, pdf or not
module.exports.multerFileTypeFilterForPdfAndMp3 = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.mimetype === 'audio/mpeg') {
    const extension = file.originalname.split('.').pop().toLowerCase();

    if (['pdf', 'mp3'].includes(extension)) {
      cb(null, true);
    } else {
      cb({ code: 'ONLY_MP3_AND_PDF_ALLOWED' }, false);
    }
  } else {
    cb({ code: 'ONLY_MP3_AND_PDF_ALLOWED' }, false);
  }
};

//check multer file type pdf or not
module.exports.multerFileTypeFilterForPdf = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    // check for extension also
    const extension = file.originalname.split('.').pop().toLowerCase(); // this will give last element

    // check for if extension allowed
    if (['pdf'].includes(extension)) {
      cb(null, true);
    } else {
      cb({ code: 'ONLY_PDF_ALLOWED' }, false);
    }
  } else {
    cb({ code: 'ONLY_PDF_ALLOWED' }, false);
  }
};

// File type filter for Excel files
module.exports.fileTypeFilterForExcel = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
    'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
    'application/vnd.ms-excel.template',
    'text/csv',
  ];

  const allowedExtensions = ['xlsx', 'xlsm', 'xls', 'xlsb', 'xltx', 'xlt', 'csv'];

  const mimeTypeIsValid = allowedMimeTypes.includes(file.mimetype);
  const extension = file.originalname.split('.').pop().toLowerCase(); // Get file extension
  const extensionIsValid = allowedExtensions.includes(extension);

  if (mimeTypeIsValid && extensionIsValid) {
    cb(null, true);
  } else {
    cb({ code: 'ONLY_EXCEL_SHEET_ALLOWED' }, false);
  }
};

module.exports.multerFileTypeFilterForImageAndVideo = (req, file, cb) => {
  if (
    // Check for image mimeTypes and extensions
    (file.mimetype.startsWith('image/') &&
      ['jpeg', 'jpg', 'png'].includes(file.originalname.split('.').pop().toLowerCase())) ||
    // Check for video mimeTypes and extensions
    (file.mimetype.startsWith('video/') &&
      ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(file.originalname.split('.').pop().toLowerCase()))
  ) {
    cb(null, true);
  } else {
    cb({ code: 'ONLY_IMAGE_AND_VIDEO_ALLOWED' }, false);
  }
};


module.exports.multerFileTypeFilterForImagePdfVideo = (req, file, cb) => {
  if (
    // Check for image mimeTypes and extensions
    (file.mimetype.startsWith('image/') &&
      ['jpeg', 'jpg', 'png'].includes(file.originalname.split('.').pop().toLowerCase())) ||
    // Check for video mimeTypes and extensions
    (file.mimetype.startsWith('video/') &&
      ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(file.originalname.split('.').pop().toLowerCase())) ||
    // PDF
    (file.mimetype === "application/pdf")
  ) {
    cb(null, true);
  } else {
    cb({ code: 'ONLY_IMAGE_AND_VIDEO_ALLOWED' }, false);
  }
};
