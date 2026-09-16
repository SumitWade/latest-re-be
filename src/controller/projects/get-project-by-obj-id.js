const projectServices = require("../../services/project.service");
const userServices = require("../../services/user.service");
const logError = require("../../utils/helper/pino-log-error");
const { idValidation } = require("../../validation/common-validation");

const getProjectByObjId = async (request, response) => {
    try {
        //Extract data from the request body
        const {id} = request.body;

        //Validation 
        const {value, error} = idValidation.validate({id});
        if (error) {
            const formattedMessage = error?.details
                .map(err => `(${err.path.join('.')}) ${err.message}`)
                .join(' | ');
            return response.validationError(formattedMessage)
        };
        
        //get data from db
        const projectData = await projectServices.getProjectByObjId(id);
        const pendingProjectDetails = await projectServices.getPendingProjectUpdate(id);
        const result = projectData.status == "pending" ? pendingProjectDetails.projectData : projectData
        if(result){
            return response.success("Data fetched successfully", result)
        }else {
            return response.notFound("No record found")
        }
    
    } catch (error) {
        console.log(error.message)
        // store log in error.log file
        logError(error, {
            api: 'getProjectByObjId',
            req: request,
        });
        return response.error(error);
    }
}

module.exports = getProjectByObjId;