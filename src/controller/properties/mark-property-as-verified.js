const notificationService = require("../../services/notification.service");
const { idValidation } = require("../../validation/common-validation");
const propertyServices = require("../../services/property.service");
const logError = require("../../utils/helper/pino-log-error");

const markPropertyAsVerified = async (request, response) => {
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

        const verified = !isPropertyExist?.isVerified;
        const dataToUpdate = {
            isVerified: verified,
        };

        // save data into db
        const result = await propertyServices.updatePropertyDetails(id, dataToUpdate);
        if (result?.acknowledged && result?.modifiedCount > 0) {
            // Notification
            if (isPropertyExist?.isVerified) {
                await notificationService.createNotificationAndEmit(
                    request.io,
                    {
                        title: "Property Verification",
                        description: "Your Property has been marked as verified.",
                        model: "property",
                        notificationFor: isPropertyExist.createdBy,
                        isSeen: false,
                        recordId: isPropertyExist?._id
                    }
                );
            }

            return response.status(200).json({
                status: "SUCCESS",
                message: isPropertyExist?.isVerified
                    ? "Property marked as Unverified"
                    : "Property marked as Verified",
            });
        } else {
            return response.status(400).json({
                status: "FAILED",
                message: "Failed to Update!",
            });
        }
    } catch (error) {
        logError(error, {
            api: "markPropertyAsVerified",
            req: request
        });
        return response.error(error);
    }
};

module.exports = markPropertyAsVerified;