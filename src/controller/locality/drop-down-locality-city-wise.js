
const localityService = require("../../services/locality.service");
const logError = require("../../utils/helper/pino-log-error");

const getLocalitiesByCity = async (req,res) =>{
    try {
        const {city} = req.body;
        if(!city){
            return res.error("City is required");
        }
        const result = await localityService.getLocalitiesByCity(city);
        if(!result){
            return res.error("Localities not found");
        }
        return res.success("Localities fetched successfully",result);
    } catch (error) {
        logError(error, {
            api: "getLocalitiesByCity",
            req: req
        });
        return res.error(error);
    }
}
module.exports = getLocalitiesByCity;