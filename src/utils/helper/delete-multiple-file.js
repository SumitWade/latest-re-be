const fs = require('fs');
const path = require('path')

//function to delete multiple files
async function deleteMultipleFiles(files) {
    try {
        const __dirname = path.resolve()
        files?.forEach(element => {
            fs?.unlink(`${__dirname}/${element.path}`, (err) => {
                if (err) {
                    console.log(err);
                }
            })
        });
    } catch (error) {
        throw error
    }

}

module.exports = deleteMultipleFiles;