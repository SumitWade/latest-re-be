const propertyServices = require("../../services/property.service");
const logError = require("../../utils/helper/pino-log-error");
const { idValidation } = require("../../validation/common-validation");

const updatePropertyActions = async (request, response) => {
    try {
        const { id, isVerified, isHotsellingProperty, isTrending } = request.body;

        // Validation 
        const { value, error } = idValidation.validate({ id });
        if (error) {
            const formattedMessage = error?.details
                .map(err => `(${err.path.join('.')}) ${err.message}`)
                .join(' | ');
            return response.validationError(formattedMessage);
        };

        const existingProperty = await propertyServices.getPropertyByObjId(id);
        if (!existingProperty) {
            return response.notFound("Property does not exist");
        }

        // Build the update object only with fields that are provided
        const dataToUpdate = {};
        if (typeof isVerified === "boolean") dataToUpdate.isVerified = isVerified;
        if (typeof isHotsellingProperty === "boolean") dataToUpdate.isHotsellingProperty = isHotsellingProperty;
        if (typeof isTrending === "boolean") dataToUpdate.isTrending = isTrending;

        if (Object.keys(dataToUpdate).length === 0) {
            return response.badRequest("No valid action flags provided.");
        }

        const result = await propertyServices.updatePropertyDetails(id, dataToUpdate);

        if (result) {
            return response.status(200).json({
                status: "SUCCESS",
                message: "Property actions updated successfully!"
            });
        } else {
            return response.status(400).json({
                status: "FAILED",
                message: "Failed to update property actions."
            });
        }
    } catch (error) {
        logError(error, {
            api: "updatePropertyActions",
            req: request
        });
        return response.error(error);
    }
};

module.exports = updatePropertyActions;
