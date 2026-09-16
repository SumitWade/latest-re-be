const projectServices = require("../../../services/project.service");


const getPublicProjectList = async (request, response) => {
    try {

        const {
            page = 1,
            ...filters
        } = request.body;

        const result = await projectServices.getAllPublicProjectList(page, filters);
        if (result) {
            return response.status(200).json({
                success: true,
                message: "Data fetched successfully",
                ...result
            });
        }

        return response.status(400).json({
            success: false,
            message: "No data available"
        });

    } catch (error) {
        console.log(error);
        return response.error(error);
    }
};

module.exports = getPublicProjectList;