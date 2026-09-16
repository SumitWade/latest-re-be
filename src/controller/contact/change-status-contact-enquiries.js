const { request } = require("express");
const logError = require("../../utils/helper/pino-log-error");
const contactService = require("../../services/contact.service");
const { enquiryStatusValidationSchema } = require("../../validation/property-validation");

const chngeStatusOfContactEnquiries = async (request, response) => {
    try {
        const { id, status } = request.body;
        const validationResult = await enquiryStatusValidationSchema.validate({ id, status });
        if (validationResult.error) {
            return response.badRequest(validationResult.error.details[0].message);
        }
        const result = await contactService.changeStatusOfContactEnquiries(id, status);
        if (!result) {
            return response.notFound("Contact enquiry not found");
        }
        return response.success("Contact enquiry status changed successfully",result);
    } catch (error) {
        logError(error, {
            api: "chngeStatusOfContactEnquiries",
            req: request
        });
        return response.error(error);
    }
}
module.exports =  chngeStatusOfContactEnquiries;