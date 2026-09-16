const fs = require('fs');
const path = require('path');

async function deletePreviousMultipleSingleFiles(files = []) {
    try {
        const __dirname = path.resolve();

        files.forEach(filePath => {
            const fullPath = path.join(__dirname, filePath);
            fs.unlink(fullPath, (err) => {
                if (err) {
                    console.error(err);
                } 
            });
        });
    } catch (error) {
        throw error;
    }
}

module.exports = deletePreviousMultipleSingleFiles;
