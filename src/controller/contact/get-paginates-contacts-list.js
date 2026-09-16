const contactService = require("../../services/contact.service");
const logError = require("../../utils/helper/pino-log-error");

const getPaginatedList = async (request, response) => {
    try {
        const { searchString, page } = request.body;
        // console.log(request);
        if (request.userType !== "admin") {
            return response.unauthorized("Unauthorized");
        }

        const result = await contactService.getAllContacts(page, searchString);
        return response.paginated(result.result, result.totalPages, result.totalRecords);
    } catch (error) {
        logError(error, {
            api: "getPaginatedList",
            req: request
        });
        return response.error(error);
    }
}
module.exports = getPaginatedList;