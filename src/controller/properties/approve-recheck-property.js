const notificationService = require("../../services/notification.service");
const propertyServices = require("../../services/property.service");
const logError = require("../../utils/helper/pino-log-error");
const deleteUnusedProjectFiles = require("../projects/project-helper-files/delete-project-previous-files");

const approveOrRecheckPropertyUpdate = async (request, response) => {
    try {
        //Extract data from the request
        const { id, userType } = request;

        //check the user
        if(userType !== "admin"){
            return response.badRequest("Only admin user can perform this action")
        }
        //Extract data from the request body
        const {propertyId, action, remark } = request.body;

        // Check Property
        const isPropertyExist = await propertyServices.getPropertyByObjId(propertyId);
        if (!isPropertyExist) {
            return response.notFound("Property does not exist");
        }

        //check if the property pending for approval 
        if(isPropertyExist.status.toLowerCase() !== "pending"){
            return response.badRequest("Action cannot be performed because the property update request is not pending.");        
        }

        // Validate Action
        if (!["approved", "recheck"].includes(action)) {
            return response.badRequest(
                "Invalid action. Allowed action are 'approved' or 'recheck'."
            );
        }

        // Get Pending Request
        const pendingRequest = await propertyServices.getPendingPropertyByObjId(propertyId);
        if (!pendingRequest) {
            return response.notFound("Pending property update not found");
        }

        // ==========================================
        // APPROVE
        // ==========================================
        if (action === "approved") {

            // Delete old files which are no longer required
            await deleteUnusedProjectFiles(
                pendingRequest.propertyId.toString(),
                pendingRequest.propertyData.allUploadedFiles
            );

            // Update property
            await propertyServices.updatePropertyDetails(
                pendingRequest.propertyId,
                {
                    ...pendingRequest.propertyData,
                    status: "approved"
                }
            );

            // Delete Pending Request
            await propertyServices.deletePendingPropertyUpdate(pendingRequest._id);
            
            // Notification
            await notificationService.createNotificationAndEmit(
                request.io,
                {
                    title: "Property details Update Approved",
                    description: "Your property update request has been approved.",
                    model: "property",
                    notificationFor: isPropertyExist.createdBy,
                    isSeen: false,
                    recordId: propertyId
                }
            );
            return response.success("property details update request approved successfully.");
        }

        // ==========================================
        // RECHECK
        // ==========================================

        await propertyServices.updatePendingPropertyStatus(
            pendingRequest._id,
            {
                status: "recheck",
                reviewedBy: id,
                reviewedAt: new Date(),
                adminRemarks: remark
            }
        );

        // Update property
        await propertyServices.updatePropertyDetails(
            pendingRequest.propertyId,
            {
                status: "recheck"
            }
        );

        await notificationService.createNotificationAndEmit(
            request.io,
            {
                title: "Property Update Needs Recheck",
                description: "Please review the admin remarks and update your property.",
                model: "property",
                notificationFor: isPropertyExist.createdBy,
                isSeen: false,
                recordId: propertyId
            }
        );
        return response.success("Property sent for recheck successfully.");

    } catch (error) {
        console.log(error)
        logError(error, {
            api: "approveOrRecheckPropertyUpdate",
            req: request
        });
        return response.error(error);
    }
};

module.exports = approveOrRecheckPropertyUpdate;