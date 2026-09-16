const fs = require('fs');

// Function to delete the previous single file
async function deletePreviousSingleFile(filePath) {
    try {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(err);
            } 
        });
    } catch (error) {
        throw error;
    }
}

module.exports = deletePreviousSingleFile;
