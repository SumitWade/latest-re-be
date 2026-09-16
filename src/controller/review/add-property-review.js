const logError = require("../../utils/helper/pino-log-error");
const propertyServices = require("../../services/property.service");
const projectServices = require("../../services/project.service");
const reviewService = require("../../services/review.service");
const { addReviewValidation } = require("../../validation/review-validation");
const notificationService = require("../../services/notification.service");
const collectUserActionData = require("../user-management/collect-user-action-data");

// add review controller (handles property & project reviews)
const addReview = async (request, response) => {
    try {
        const { propertyId, projectId, reviewType, title, description, rating } = request.body;

        // validation
        const validateError = addReviewValidation.validate({ propertyId, reviewType, title, description, rating, projectId });
        if (validateError.error) {
            return response.validationError(validateError?.error?.message);
        }

        // only visitor can add reviews
        if (request.userType !== "visitor") {
            return response.error("Only visitor can add reviews");
        }

        let targetOwnerId = null;
        let targetTitle = "";

        if (reviewType === "project") {
            if (!projectId) {
                return response.badRequest("ProjectId is required for project review");
            }
            const project = await projectServices.getProjectByObjId(projectId);
            if (!project) {
                return response.notFound("Project not found");
            }
            targetOwnerId = project.createdBy;
            targetTitle = project.name || "Project";
        } else if (reviewType === "property") {
            if (!propertyId) {
                return response.badRequest("PropertyId is required for property review");
            }
            const property = await propertyServices.getPropertyByObjId(propertyId);
            if (!property) {
                return response.notFound("Property not found");
            }
            targetOwnerId = property.createdBy;
            targetTitle = property.propertyTitle || "Property";
        }

        // check already review added for same target
        const isReviewExist = await reviewService.getReviewByUserId(
            request._id,
            reviewType === "project" ? projectId : propertyId,
            reviewType
        );
        if (isReviewExist) {
            return response.error(`You have already added a review for this ${reviewType}`);
        }

        const review = {
            reviewedBy: request._id,
            reviewType,
            propertyId: reviewType === "property" ? propertyId : null,
            projectId: reviewType === "project" ? projectId : null,
            title,
            description,
            rating
        };

        const result = await reviewService.addReview(review);

        // Send notification to owner/creator
        if (targetOwnerId) {
            const notificationData = {
                title: "New Review Received",
                description: `New review added for "${targetTitle}"`,
                model: "review",
                link: '/admin/reviews',
                notificationFor: targetOwnerId,
                createdBy: request._id,
                recordId: (reviewType === "project" ? projectId : propertyId).toString(),
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
            actionType: 'REVIEW',
            propertyId: propertyId,
            projectId: projectId,
            action: "Rate And Review"
        });
        return response.success("Review added successfully", result);
    } catch (error) {
        logError(error, {
            api: "addReview",
            req: request
        });
        return response.error(error);
    }
}
module.exports = addReview;