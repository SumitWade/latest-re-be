const path = require("path");

async function getUploadedFilesUrl(files) {
    try {
        const groupedFiles = {};

        files?.forEach(file => {

            const folderName = path.basename(file.destination);

            const documentData = {
                fieldName: file.fieldname,
                documentName: file.originalname,
                fileUrl: `public/document/${folderName}/${file.filename}`,
                type: file.mimetype.startsWith("image/")
                    ? "image"
                    : file.mimetype === "application/pdf"
                    ? "pdf"
                    : "video"
            };

            if (!groupedFiles[file.fieldname]) {
                groupedFiles[file.fieldname] = [];
            }

            groupedFiles[file.fieldname].push(documentData);

        });

        return groupedFiles;

    } catch (error) {
        throw error;
    }
}

module.exports = getUploadedFilesUrl;