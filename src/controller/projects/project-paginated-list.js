const projectServices = require("../../services/project.service");
const logError = require("../../utils/helper/pino-log-error");

const projectPaginatedList = async (request, response) => {
    try {
        //Extract data form the request 
        const {id, userType} = request; 

        //Extract data from the request body
        const {page, searchString, projType} = request.body;

        //Extract data from the db
        const result = await projectServices.projectPaginatedList(page, searchString, projType, id, userType);

        //if data not available
        if(result.length == 0) { return response.badRequest("No data available")}

        return response.paginated(result.result, result.totalPages, result.totalRecords)
    } catch (error) {
        console.log(error.message)
        // store log in error.log file
        logError(error, {
            api: 'projectPaginatedList',
            req: request,
        });
        return response.error(error);
    }
};

module.exports = projectPaginatedList;