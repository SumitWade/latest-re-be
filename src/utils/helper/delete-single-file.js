const fs = require('fs');
const path = require('path')

//function to delete single file
async function deleteSingleFile(file) {
    try {
        const __dirname = path.resolve()
        fs?.unlink(`${__dirname}/${file?.path}`, (err) => {
            if (err) {
                console.log(err);
            }
        })
    } catch (error) {
        throw error
    }

}

module.exports = deleteSingleFile;