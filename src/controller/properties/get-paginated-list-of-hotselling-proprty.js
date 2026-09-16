const propertyServices = require("../../services/property.service");
const logError = require("../../utils/helper/pino-log-error");

const listOfHotsellingProperty = async (request, response) => {
    try {
        const { page, searchString, propertyType } = request.body;
        const result = await propertyServices.getHotsellingProperty(page, searchString, propertyType);
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
    } catch (error) {
        console.log(error)
        logError(error, {
            api: "listOfHotsellingProperty",
            req: request
        });
        return response.error(error);
    }
}
module.exports = listOfHotsellingProperty;