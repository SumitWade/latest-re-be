const projectServices = require("../../../services/project.service");


const getPublicProjectById = async (request, response) => {
    try {

        const { id } = request.body;
        const result = await projectServices.getPublicProjectById(id)

        if (result) {
            return response.status(200).json({
                status: "Data fetched successfully",
                result
            })
        } else {
            return response.status(400).json({
                status: "No data available",
            })
        }

    } catch (error) {
        console.log(error.message)
        return response.status(500).json({
            status: "Internal Server Error",
            message: error.message
        })
    }
}

module.exports = getPublicProjectById;