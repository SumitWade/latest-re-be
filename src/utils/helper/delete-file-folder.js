const fs = require("fs/promises");
const path = require("path");

const deleteUploadedFileFolder = async (folderName) => {
    try {
        const folderPath = path.join("public", "document", folderName);
        await fs.rm(folderPath, {
            recursive: true,
            force: true,
        });
    } catch (error) {
        console.error("Error deleting folder:", error);
    }
};

module.exports = deleteUploadedFileFolder;