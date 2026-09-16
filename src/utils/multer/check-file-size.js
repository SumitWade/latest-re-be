const imageSize = process.env.IMAGE_LIMIT
const pdfSize = process.env.PDF_LIMIT
const videoSize = process.env.VIDEO_LIMIT

const validateFileSize = (files = []) => {
    for (const file of files) {
        let limit;

        if (file.mimetype?.startsWith("image/")) {
            limit = imageSize;
        } else if (file.mimetype === "application/pdf") {
            limit = pdfSize;
        } else if (file.mimetype?.startsWith("video/")) {
            limit = videoSize;
        } else {
            limit = imageSize;
        }

        if (file.size > limit) {
            return {
                isValid: false,
                message: `${file.originalname} (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum allowed size of ${(limit / (1024 * 1024)).toFixed(0)} MB.`
            };
        }
    }

    return {
        isValid: true,
        message: null
    };
};

module.exports = validateFileSize;