const notificationService = require("../../services/notification.service");
const propertyEnquiryService = require("../../services/property-enquiry.service");
const propertyServices = require("../../services/property.service");
const logError = require("../../utils/helper/pino-log-error");
const { addPropertyEnquiryValidation } = require("../../validation/enquiry-validation");
const collectUserActionData = require("../user-management/collect-user-action-data");
const addPropertyEnquiry = async (request, response) => {
    try {
        const { propertyId, name, email, phone, message } = request.body;
        // validation
        const validationResult = addPropertyEnquiryValidation.validate({ propertyId, name, email, phone, message });
        if (validationResult.error) {
            return response.validationError(validationResult.error.details[0].message);
        }
        // check property exist or not 
        const isPropertyExists = await propertyServices.getPropertyByObjId(propertyId);
        if (!isPropertyExists) {
            return response.notFound("Property not found");
        }

        const propertyEnquiry = await propertyEnquiryService.addPropertyEnquiry({
            propertyId,
            userId: request?._id,
            name,
            email,
            phone,
            message
        });

        if (isPropertyExists.createdBy) {
            const notificationData = {
                title: "New Enquiry Received",
                description: `New enquiry received for "${isPropertyExists.propertyTitle || 'Property'}"`,
                model: "enquiry",
                link: '/admin/enquiries',
                notificationFor: isPropertyExists.createdBy,
                createdBy: request?._id || null,
                recordId: propertyEnquiry._id ? propertyEnquiry._id.toString() : propertyId.toString(),
                isSeen: false
            };
            if (request.io) {
                await notificationService.createNotificationAndEmit(request.io, notificationData);
            } else {
                await notificationService.addNotification(notificationData);
            }
        }

        // 🟢 Automatically record the user action
        await collectUserActionData({
            userId: request.id,
            actionType: 'ENQUIRY_ON_PROPERTY',
            propertyId: propertyId,
            action: "User Enquired About The Property"
        });
        return response.success("Property enquiry added successfully", propertyEnquiry);
    } catch (error) {
        logError(error, {
            api: "addPropertyEnquiry",
            req: request
        });
        return response.error(error);
    }
}
module.exports = addPropertyEnquiry;