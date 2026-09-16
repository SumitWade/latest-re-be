const localityService = require("../../services/locality.service");

const getAllLocalities = async (req, res) => {
    try {
        // Fetch all localities and sort them alphabetically by name
        const localities = await localityService.getAllLocalities();

        return res.status(200).json({
            status: "SUCCESS",
            message: "Localities fetched successfully",
            data: localities
        });

    } catch (error) {
        console.error("Error fetching localities:", error);
        return res.status(500).json({
            status: "FAILED",
            message: "Internal server error while fetching localities"
        });
    }
};

module.exports = getAllLocalities;
