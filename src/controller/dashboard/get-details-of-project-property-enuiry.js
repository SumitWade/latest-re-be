const dashboardService = require("../../services/dashboard.service");
const logError = require("../../utils/helper/pino-log-error");

const totalEnquiries = async (request, response) => {
try{
    const id = request.id;
    const userType = request.userType;
    const result = await dashboardService.getTotalEnquiriesCount({ id, userType });
    return response.success("Enquiry count fetched successfully", result);
}
catch(error){
    logError(error, {
        api: "totalEnquiries",
        req: request
    });
    return response.error(error);
}
}
module.exports = totalEnquiries;