const projectServices = require("../../services/project.service");
const logError = require("../../utils/helper/pino-log-error");
const { enquiryStatusValidationSchema } = require("../../validation/property-validation");

const changeProjectEnquiryStatus = async (request, response) => {
    try {
        const { id, status } = request.body;
        const validationResult = await enquiryStatusValidationSchema.validate({ id, status });
        if (validationResult.error) {
            return response.badRequest(validationResult.error.details[0].message);
        }
        const updatedEnquiry = await projectServices.changeEnquiryStatus(id, { status: status });
        if (!updatedEnquiry) {
            return response.badRequest("Enquiry not found");
        }
        return response.success("Enquiry status changed successfully", updatedEnquiry);
    } catch (error) {
        logError(error, {
            api: "changeProjectEnquiryStatus",
            req: request
        });
        return response.internalServerError()
    }
}
module.exports = changeProjectEnquiryStatus;