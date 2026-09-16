const localityService = require("../../services/locality.service");
const logError = require("../../utils/helper/pino-log-error");

const deleteLocality = async(request , response)=>{
    try{
        const { id } = request.body;
        const locality = await localityService.getLocalityById(id);
        if (!locality) {
            return response.notFound("Locality not found");
        }
        const result = await localityService.deleteLocalityById(id);
        if (result?.acknowledged && result?.deletedCount > 0) {
            return response.success("Locality deleted successfully", {
                deleted: true
            });
        }else {
            return response.error("Failed to delete locality");
        }
    }catch(error){
        logError(error, {
            api: "deleteLocality",
            req: request,
        });
        return response.error(error);
    }
}
module.exports = deleteLocality;