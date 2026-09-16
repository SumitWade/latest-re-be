const propertyServices = require("../../services/property.service");
const logError = require("../../utils/helper/pino-log-error");

const updatePropertyStatusByAdmin = async (request, response) => {
    try {
        //Extract data form the request 
        const { id, userType } = request;
        if (userType !== "admin") {
            return response.unauthorized("You are not authorized to perform this action");
        }
        //Extract data from the request body
        const { page, searchString, propertyType } = request.body;

        //Extract data from the db
        const result = await propertyServices.updatePropertyActions(page, searchString, propertyType, id, userType);

        //if data not available
        if (result.length == 0) { return response.badRequest("No data available") }

        return response.paginated(result.result, result.totalPages, result.totalRecords)
    } catch (error) {
        console.log(error.message)
        // store log in error.log file
        logError(error, {
            api: 'updatePropertyStatusByAdmin',
            req: request,
        });
        return response.error(error);
    }
};

module.exports = updatePropertyStatusByAdmin;