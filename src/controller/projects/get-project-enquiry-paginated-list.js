const logError = require("../../utils/helper/pino-log-error")
const projectServices = require("../../services/project.service");
const getEnquiryPaginatedList = async (request, response) => {
    try {
        const { searchString, page } = request.body;

        const result = await projectServices.getProjectEnquiryList(searchString, page);
        if (!result) {
            return response.notFound("Property enquiry not found.")
        }
        // showing only those enquiries which belong to developer or agent
        if (request.userType === "developer" || request.userType === "agent" || request.userType === "owner") {
            const developerEnquiryList = await projectServices.getDeveloperEnquiryList(searchString, page, request._id);
            return response.paginated(developerEnquiryList.result, developerEnquiryList.totalPages, developerEnquiryList.totalRecords);
        }
        else if (request.userType === "admin") {
            return response.paginated(result.result, result.totalPages, result.totalRecords);
        }
        else return response.unauthorized("Unauthorized")
    } catch (error) {
        logError("Error in getEnquiryPaginatedList", error);
        response.error("Something went wrong");
    }

}
module.exports = getEnquiryPaginatedList