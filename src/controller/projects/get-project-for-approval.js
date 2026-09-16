const projectServices = require("../../services/project.service");
const logError = require("../../utils/helper/pino-log-error");
const compareProjectData = require("./project-helper-files/compare-project-helper");

const getProjectForApproval = async (request, response) => {
    try {
        // extract data from the request body
        const { projectId } = request.body;

        //check project exist or not
        const project = await projectServices.getProjectByObjId(projectId);
        if (!project) {
            return response.notFound("Project not found");
        }

        //get pending project 
        const pendingUpdate = await projectServices.getPendingProjectUpdate(projectId);
        if (!pendingUpdate) {
            return response.success("Project fetched successfully", {
                project,
                pendingProject: null,
                comparison: null
            });
        }

        //compare details
        const comparison = compareProjectData(
            pendingUpdate.projectSnapshot,
            pendingUpdate.projectData
        );

        //send response
        return response.success("Project fetched successfully", {
            project,
            pendingProject: pendingUpdate.projectData,
            status: pendingUpdate.status,
            adminRemarks: pendingUpdate.adminRemarks,
            comparison
        });

    } catch (error) {
        logError(error, {
            api: "getProjectForApproval",
            req: request
        });
        return response.error(error);
    }
};

module.exports = getProjectForApproval;