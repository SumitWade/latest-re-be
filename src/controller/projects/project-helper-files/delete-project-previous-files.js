const fs = require("fs");
const path = require("path");

async function deleteUnusedProjectFiles(projectFolder, latestFiles = []) {
    try {
        const folderPath = path.join("public", "document", projectFolder );

        if (!fs.existsSync(folderPath)) { return }

        // Files that should remain
        const latestFileNames = new Set(latestFiles.map(file => path.basename(file.fileUrl)));

        const folderFiles = fs.readdirSync(folderPath);
        for (const file of folderFiles) {
            if (!latestFileNames.has(file)) {
                const filePath = path.join(folderPath, file);
                fs.unlinkSync(filePath);
                console.log(`Deleted: ${filePath}`);
            }
        }
    } catch (error) {
        throw error;
    }
}

module.exports = deleteUnusedProjectFiles;