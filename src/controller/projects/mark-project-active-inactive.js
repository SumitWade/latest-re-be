const notificationService = require("../../services/notification.service");
const projectServices = require("../../services/project.service");
const logError = require("../../utils/helper/pino-log-error");
const { idValidation } = require("../../validation/common-validation");

const markProjectActiveInactive = async (request, response) => {
   try {
        //Extract data from the request body
        const {id} = request.body;

        //Validation 
        const {value, error} = idValidation.validate({id});
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

        const isActive = !isProjectExist?.isActive;
        const dataToUpdate = {
                isActive: isActive,
                status: isProjectExist.status == "new" ? "approved" : isProjectExist.status
        };

      // save data into db
      const result = await projectServices.updateProjectDetails(id, dataToUpdate);
      if (result?.acknowledged && result?.modifiedCount > 0) {
        // Notification
        await notificationService.createNotificationAndEmit(
            request.io,
            {
                title: "Project Approved",
                description: "Your project has been approved and is now live to the public.",
                model: "project",
                notificationFor: isProjectExist.developerId,
                isSeen: false,
                recordId: isProjectExist?._id
            }
        );
         return response.status(200).json({
            status: "SUCCESS",
            message: isProjectExist?.isActive
               ? "Project marked as inactive for public!"
               : "Project marked as live for public!",
         });
      } else {
         return response.status(400).json({
            status: "FAILED",
            message: "Failed to Update!",
         });
      }
   } catch (error) {
        logError(error, {
            api: "changeActiveStatusTender",
            req: request
        });
        return response.error(error);
   }
};

module.exports = markProjectActiveInactive;