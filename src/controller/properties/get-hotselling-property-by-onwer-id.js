const propertyServices = require("../../services/property.service");
const logError = require("../../utils/helper/pino-log-error");

const listOfHotsellingPropertyByOwnerId = async (request, response) => {
    try {
        const { ownerId, page } = request.body;
        if (!ownerId) {
            return response.notFound("ownerId is required");
        }
        const result = await propertyServices.getHotsellingPropertyByOwnerId(ownerId, page);
        if(result.totalPages > 0){
            return response.status(200).json({
                status: "SUCCESS",
                message: "Data fetched successfully.",
                totalPages: result.totalPages,
                totalRecords: result.totalRecords,
                result : result.result
            })
        }
        else {
            return response.notFound("Data not found");
        }
        return response.success("Properties fetched successfully", result);
    } catch (error) {
        console.log(error)
        logError(error, {
            api: "listOfHotsellingPropertyByOwnerId",
            req: request
        });
        return response.error(error);
    }
}
module.exports = listOfHotsellingPropertyByOwnerId;
