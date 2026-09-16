const projectServices = require("../../services/project.service");
const logError = require("../../utils/helper/pino-log-error");

const getAllProjectList = async (request, response) => {
    try {
        //Extract data form the request 
        const {id} = request;

        //Extract data from the db
        const result = await projectServices.getAllProjectList(id)
        if(result.length > 0){
            return response.success("Data fetched successfully.", result)
        } else {
            return response.badRequest("No data available")
        }
    } catch (error) {
        console.log(error.message)
        // store log in error.log file
        logError(error, {
            api: 'getAllProjectList',
            req: request,
        });
        return response.error(error);
    }
};

module.exports = getAllProjectList;