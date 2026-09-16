const localityService = require("../../services/locality.service");
const logError = require("../../utils/helper/pino-log-error");

const getCityDropdown = async (request,response) => {
    try{
        const result = await localityService.getCityList();
        if(!result){
            return response.notFound("City dropdown not found");
        }
        return response.success("City dropdown fetched successfully", result);
    }catch(error){
        logError(error, {
            api: "getCityDropdown",
            req: request
        })
        return res.error(error)
    }
}

module.exports = getCityDropdown;