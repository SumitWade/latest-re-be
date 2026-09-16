const notificationService = require("../../services/notification.service");
const { idValidation } = require("../../validation/common-validation");
const propertyServices = require("../../services/property.service");
const logError = require("../../utils/helper/pino-log-error");

const markPropertyActiveInactive = async (request, response) => {
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
        const isPropertyExist = await propertyServices.getPropertyByObjId(id);
        if (!isPropertyExist) {
            return response.notFound("Property does not exist");
        }

        const isActive = !isPropertyExist?.isActive;
        const dataToUpdate = {
            isActive: isActive,
            status: isPropertyExist.status == "new" ? "approved" : isPropertyExist.status
        };

        // save data into db
        const result = await propertyServices.updatePropertyDetails(id, dataToUpdate);
        if (result?.acknowledged && result?.modifiedCount > 0) {
            // Notification
            if(isPropertyExist?.isActive){
                await notificationService.createNotificationAndEmit(
                    request.io,
                    {
                        title: "Property Approved",
                        description: "Your Property has been approved and is now live to the public.",
                        model: "property",
                        notificationFor: isPropertyExist.createdBy,
                        isSeen: false,
                        recordId: isPropertyExist?._id
                    }
                );
            }       
            return response.status(200).json({
                status: "SUCCESS",
                message: isPropertyExist?.isActive
                    ? "Property marked as inactive for public!"
                    : "Property marked as live for public!",
            });
        } else {
            return response.status(400).json({
                status: "FAILED",
                message: "Failed to Update!",
            });
        }
    } catch (error) {
        logError(error, {
            api: "markPropertyActiveInactive",
            req: request
        });
        return response.error(error);
    }
};

module.exports = markPropertyActiveInactive;