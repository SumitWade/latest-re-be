const notificationService = require("../../services/notification.service");
const { idValidation } = require("../../validation/common-validation");
const projectServices = require("../../services/project.service");
const logError = require("../../utils/helper/pino-log-error");

const markProjectAsVerified = async (request, response) => {
    try {
        //Extract data from the request body
        const { id } = request.body;

        //Validation 
        const { value, error } = idValidation.validate({ id });
        if (error) {
            const formattedMessage = error?.details
                .map(err => `(${err.path.join('.')}) ${err.message}`)
                .join(' | ');
            return response.validationError(formattedMessage)
        };

        // Check Project
        const isProjectExist = await projectServices.getProjectByObjId(id);
        if (!isProjectExist) {
            return response.notFound("Project does not exist");
        }

        const verified = !isProjectExist?.isVerified;
        const dataToUpdate = {
            isVerified: verified,
        };

        // save data into db
        const result = await projectServices.updateProjectDetails(id, dataToUpdate);
        if (result?.acknowledged && result?.modifiedCount > 0) {
            // Notification
            if (isProjectExist?.isVerified) {
                await notificationService.createNotificationAndEmit(
                    request.io,
                    {
                        title: "Project Verification",
                        description: "Your Project has been marked as verified.",
                        model: "project",
                        notificationFor: isProjectExist.createdBy,
                        isSeen: false,
                        recordId: isProjectExist?._id
                    }
                );
            }

            return response.status(200).json({
                status: "SUCCESS",
                message: isProjectExist?.isVerified
                    ? "Project marked as Unverified"
                    : "Project marked as Verified",
            });
        } else {
            return response.status(400).json({
                status: "FAILED",
                message: "Failed to Update!",
            });
        }
    } catch (error) {
        logError(error, {
            api: "markProjectAsVerified",
            req: request
        });
        return response.error(error);
    }
};

module.exports = markProjectAsVerified;