const notificationService = require("../../services/notification.service");
const projectServices = require("../../services/project.service");
const logError = require("../../utils/helper/pino-log-error");
const { addProjectEnquiryValidation } = require("../../validation/enquiry-validation");
const collectUserActionData = require("../user-management/collect-user-action-data");
const addProjectEnquiry = async (request, response) => {
    try {
        const { projectId, name, email, phone, message } = request.body;
        // validation
        const validationResult = addProjectEnquiryValidation.validate({ projectId, name, email, phone, message });
        if (validationResult.error) {
            return response.validationError(validationResult.error.details[0].message);
        }
        // check property exist or not 
        const isProjectExists = await projectServices.getProjectById(projectId);
        if (!isProjectExists) {
            return response.notFound("Project not found");
        }
        console.log(isProjectExists, "------")
        const projectEnquiry = await projectServices.addProjectEnquiryDetails({
            projectId,
            userId: request?.id,
            name,
            email,
            phone,
            message
        });


        if (isProjectExists.createdBy) {
            const notificationData = {
                title: "New Enquiry Project Received",
                description: `New enquiry received for "${isProjectExists.name || 'Project'}"`,
                model: "enquiry",
                link: '/admin/project-enquiries',
                notificationFor: isProjectExists.createdBy,
                createdBy: request?._id || null,
                recordId: projectEnquiry._id ? projectEnquiry._id.toString() : projectId.toString(),
                isSeen: false
            };
            if (request.io) {
                await notificationService.createNotificationAndEmit(request.io, notificationData);
            } else {
                await notificationService.addNotification(notificationData);
            }
        }
        await collectUserActionData({
            userId: request.id,
            actionType: 'ENQUIRY_ON_PROJECT',
            projectId: projectId,
            action: "User Enquired About The Project"
        });
        return response.success("Project enquiry added successfully", projectEnquiry);
    } catch (error) {
        logError(error, {
            api: "addProjectEnquiry",
            req: request
        });
        return response.error(error);
    }
}
module.exports = addProjectEnquiry;