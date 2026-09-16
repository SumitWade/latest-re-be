
const propertyServices = require("../../services/property.service");
const logError = require("../../utils/helper/pino-log-error");
const comparePropertyData = require("./property-helper-files.js/compare-property-helper");

const getPropertyForApproval = async (request, response) => {
    try {
        // extract data from the request body
        const { propertyId } = request.body;

        //check project exist or not
        const property = await propertyServices.getPropertyByObjId(propertyId);
        if (!property) {
            return response.notFound("Property not found");
        }

        //get pending property 
        const pendingUpdate = await propertyServices.getPendingPropertyByObjId(propertyId);
        if (!pendingUpdate) {
            return response.success("Data fetched successfully", {
                property,
                pendingProperty: null,
                comparison: null
            });
        }

        //compare details
        const comparison = comparePropertyData(
            pendingUpdate.propertySnapshot,
            pendingUpdate.propertyData
        );

        //send response
        return response.success("Data fetched successfully", {
            property,
            pendingProperty: pendingUpdate.propertyData,
            status: pendingUpdate.status,
            adminRemarks: pendingUpdate.adminRemarks,
            comparison
        });

    } catch (error) {
        logError(error, {
            api: "getPropertyForApproval",
            req: request
        });
        return response.error(error);
    }
};

module.exports = getPropertyForApproval;