const userServices = require("../../services/user.service");
const logError = require("../../utils/helper/pino-log-error");

const userPaginatedList = async (request, response) => {
    try {
        //Extract data from the request body
        const {page, searchString, type} = request.body;

        //Extract data from the db
        const result = await userServices.userPaginatedList(page, searchString, type);

        //if data not available
        if(result.length == 0) { return response.badRequest("No data available")}

        return response.paginated(result.result, result.totalPages, result.totalRecords)
    } catch (error) {
        console.log(error.message)
        // store log in error.log file
        logError(error, {
            api: 'userPaginatedList',
            req: request,
        });
        return response.error(error);
    }
};

module.exports = userPaginatedList;