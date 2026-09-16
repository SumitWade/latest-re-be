const projectServices = require("../../services/project.service");

const getLocationDetailsByProjectId = async (request, response) => {
    try {
        const { projectId } = request.body;
        if (!projectId) {
            return response.badRequest("Project ID is required");
        }
        const result = await projectServices.getProjectLocationDetails(projectId);
        if (!result) {
            return response.notFound("Project not found");
        }
        return response.success("Location details fetched successfully", result);
    } catch (error) {
        logError(error, {
            api: "getLocationDetailsByProjectId",
            req: request
        })
        return response.error(error)
    }
}
module.exports = getLocationDetailsByProjectId;