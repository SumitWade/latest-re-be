const logError = require("../../utils/helper/pino-log-error");
const propertyEnquiryService = require("../../services/property-enquiry.service");

const propertyEnquiryList = async (request, response) => {
    try {
        const { searchString, page } = request.body;
        console.log(request.user, "-------------------------------");

        const result = await propertyEnquiryService.getPropertyEnquiryList(searchString, page);
        if (!result) {
            return response.notFound("Property enquiry not found.")
        }
        if (request.userType === "developer" || request.userType === "agent" || request.userType === "owner") {
            const developerEnquiryList = await propertyEnquiryService.getDeveloperEnquiryList(searchString, page, request._id);
            return response.paginated(developerEnquiryList.result, developerEnquiryList.totalPages, developerEnquiryList.totalRecords);
        }
        else if (request.userType === "admin") {
            return response.paginated(result.result, result.totalPages, result.totalRecords);
        }
        else return response.unauthorized("Unauthorized")
    } catch (error) {
        logError(error, {
            api: "propertyEnquiryList",
            req: request
        });
        return response.error(error);
    }
}
module.exports = propertyEnquiryList;