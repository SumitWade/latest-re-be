const path = require("path");
const fs = require("fs");

const downloadPropertyTemplate = async (req, res) => {
    try {
        const filePath = path.join(
            __dirname,
            "../../../public/template/Property_Bulk_Upload.xlsx"
        );

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                status: "FAILED",
                message: "No template available"
            });
        }

        return res.download(filePath);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "FAILED",
            message: "Internal Server Error"
        });
    }
};

module.exports = downloadPropertyTemplate;