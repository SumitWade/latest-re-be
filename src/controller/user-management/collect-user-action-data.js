const UserAction = require("../../model/user-action-model");
const logError = require("../../utils/helper/pino-log-error");

const collectUserActionData = async ({ userId, actionType, propertyId, projectId, details,action }) => {
    try {
        if (!userId || !actionType) {
            console.error("userId and actionType are required to log user action.");
            return false;
        }

        // Get today's date in YYYY-MM-DD format based on local time
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];

        const newAction = {
            actionType,
            propertyId: propertyId || null,
            projectId: projectId || null,
            details: details || {},
            timestamp: today,
            action : action || ""
        };

        // Find if a record exists for this user today
        const existingRecord = await UserAction.findOne({ userId, dateString });

        if (existingRecord) {
            existingRecord.actions.push(newAction);
            await existingRecord.save();
        } else {
            const newUserAction = new UserAction({
                userId,
                dateString,
                actions: [newAction]
            });
            await newUserAction.save();
        }
        return true;

    } catch (error) {
        logError(error, {
            api: "collectUserActionData (Internal Service)",
            details: { userId, actionType, propertyId, projectId }
        });
        return false;
    }
};

module.exports = collectUserActionData;