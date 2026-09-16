const fs = require('fs')
const path = require('path')

//function to delete the previous multiple files
async function deletePreviousMultipleFiles(files) {
    try {
        const __dirname = path.resolve()
        files?.forEach(element => {            
            fs?.unlink(`${__dirname}/${element?.fileUrl || element?.file || element?.image || element?.docFile}`, (err) => {
                if (err) {
                    console.log(err);
                }
            })
        });
    } catch (error) {
        throw error;
    }
}

module.exports = deletePreviousMultipleFiles;