const notificationService = require("../../services/notification.service");
const { idValidation } = require("../../validation/common-validation");
const propertyServices = require("../../services/property.service");
const logError = require("../../utils/helper/pino-log-error");
const userServices = require("../../services/user.service");
const projectServices = require("../../services/project.service");

const activeInactiveUser = async (request, response) => {
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

        //check if the user exist or not
        const isRecordExist = await userServices.getUserByObjectId(id);
        if(!isRecordExist){
            return response.notFound("User record not found")
        };

        const isActive = !isRecordExist?.isActive;
        const dataToUpdate = { isActive: isActive };

        // save data into db
        const result = await userServices.updateUser(id, dataToUpdate);
        if (result?.acknowledged && result?.modifiedCount > 0) {  
            // Update ALL properties
            await propertyServices.updatePropertiesStatusByUserId(id, isActive );
            // Update ALL properties
            await projectServices.updateProjectStatusByUserId(id, isActive );
            return response.status(200).json({
                status: "SUCCESS",
                message: isRecordExist?.isActive
                    ? "User account marked as inactive"
                    : "User account marked as active",
            });
        } else {
            return response.status(400).json({
                status: "FAILED",
                message: "Failed to Update!",
            });
        }
    } catch (error) {
        logError(error, {
            api: "activeInactiveUser",
            req: request
        });
        return response.error(error);
    }
};

module.exports = activeInactiveUser;