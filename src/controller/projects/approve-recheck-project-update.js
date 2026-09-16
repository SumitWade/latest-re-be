const notificationService = require("../../services/notification.service");
const projectServices = require("../../services/project.service");
const logError = require("../../utils/helper/pino-log-error");
const deleteUnusedProjectFiles = require("./project-helper-files/delete-project-previous-files");

const approveOrRecheckProjectUpdate = async (request, response) => {
    try {
        //Extract data from the request
        const { id, userType } = request;

        //check the user
        if (userType !== "admin") {
            return response.badRequest("Only admin user can perform this action")
        }
        //Extract data from the request body
        const { projectId, action, remark } = request.body;
        // Check Project
        const isProjectExist = await projectServices.getProjectByObjId(projectId);
        if (!isProjectExist) {
            return response.notFound("Project does not exist");
        }

        //check if the project pending for approval 
        if (isProjectExist.status.toLowerCase() !== "pending") {
            return response.badRequest("Action cannot be performed because the project update request is not pending.");
        }

        // Validate Action
        if (!["approved", "recheck"].includes(action)) {
            return response.badRequest(
                "Invalid action. Allowed action are 'approved' or 'recheck'."
            );
        }

        // Get Pending Request
        const pendingRequest = await projectServices.getPendingProjectUpdate(projectId);
        if (!pendingRequest) {
            return response.notFound("Pending project update not found");
        }

        // ==========================================
        // APPROVE
        // ==========================================
        if (action === "approved") {

            // Delete old files which are no longer required
            await deleteUnusedProjectFiles(
                pendingRequest.projectId.toString(),
                pendingRequest.projectData.allUploadedFiles
            );

            // Update Project
            await projectServices.updateProjectDetails(
                pendingRequest.projectId,
                {
                    ...pendingRequest.projectData,
                    status: "approved"
                }
            );

            // Delete Pending Request
            await projectServices.deletePendingProjectUpdate(pendingRequest._id);

            // Notification
            await notificationService.createNotificationAndEmit(
                request.io,
                {
                    title: "Project Update Approved",
                    description: "Your project update request has been approved.",
                    model: "project",
                    notificationFor: pendingRequest.developerId,
                    isSeen: false,
                    recordId: projectId
                }
            );
            return response.success("Project update approved successfully.");
        }

        // ==========================================
        // RECHECK
        // ==========================================

        await projectServices.updatePendingStatus(
            pendingRequest._id,
            {
                status: "recheck",
                reviewedBy: id,
                reviewedAt: new Date(),
                adminRemarks: remark
            }
        );

        // Update Project
        await projectServices.updateProjectDetails(
            pendingRequest.projectId,
            {
                status: "recheck"
            }
        );

        await notificationService.createNotificationAndEmit(
            request.io,
            {
                title: "Project Update Needs Recheck",
                description: "Please review the admin remarks and update your project.",
                model: "project",
                notificationFor: pendingRequest.developerId,
                isSeen: false,
                recordId: projectId
            }
        );
        return response.success("Project sent for recheck successfully.");

    } catch (error) {
        logError(error, {
            api: "approveOrRecheckProjectUpdate",
            req: request
        });
        return response.error(error);
    }
};

module.exports = approveOrRecheckProjectUpdate;