const propertyServices = require("../../services/property.service");
const userServices = require("../../services/user.service");
const logError = require("../../utils/helper/pino-log-error");
const { idValidation } = require("../../validation/common-validation");

const getPropertyByObjId = async (request, response) => {
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
        
        //get data from property collection
        const propertyData = await propertyServices.getPropertyByObjId(id);
        //get data 
        const pendingPropertyDetails = await propertyServices.getPendingPropertyByObjId(id);
        const result = propertyData.status == "pending" ? pendingPropertyDetails.propertyData : propertyData
        if(result){
            return response.success("Data fetched successfully", result)
        }else {
            return response.notFound("No record found")
        }
    
    } catch (error) {
        console.log(error.message)
        // store log in error.log file
        logError(error, {
            api: 'getPropertyByObjId',
            req: request,
        });
        return response.error(error);
    }
}

module.exports = getPropertyByObjId;