const propertyServices = require("../../services/property.service");

const markPropertyAsHotSelling = async (request, response) => {
    try {
        const { id } = request.body;
        
        const result = await propertyServices.markPropertyAsHotSelling(id);

        return response.status(200).json({
            status: "SUCCESS",
            message: result?.isHotsellingProperty 
                ? "Property marked as hot selling successfully" 
                : "Property removed from hot selling successfully"
        });
    } catch (error) {
        logError(error, {
            api: "markPropertyAsHotSelling",
            req: request
        });
        return response.error(error);
    }
}
module.exports = markPropertyAsHotSelling;