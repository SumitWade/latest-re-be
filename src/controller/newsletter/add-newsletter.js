const notificationService = require("../../services/notification.service");
const newsletterService = require("../../services/newsletter.service");
const userServices = require("../../services/user.service");
const logError = require("../../utils/helper/pino-log-error");

const addNewsLetter = async (request, response) => {
    try {
        const { email } = request.body
        if (!email) {
            return response.badRequest("Please provide email");
        }
        const existUser = await newsletterService.getNewsletterByEmail(email)
        if (existUser) {
            return response.error("Email already exists")
        }
        const data = {
            email
        }
        const newsletter = await newsletterService.addNewsLetter(data)

        // Fetch admin users to notify
        let adminUsers = await userServices.getAdminUsers();
        if (!adminUsers.length) {
            const admin = await userServices.createDefaultAdmin();
            adminUsers = [admin];
        }
        console.log(adminUsers, "-----------")
        const notifications = adminUsers.map((admin) => ({
            title: "New Newsletter Subscription",
            description: `New newsletter subscription from ${email}`,
            model: "newsletter",
            link: '/admin/newsletters',
            notificationFor: admin._id,
            createdBy: request?._id || null,
            recordId: newsletter._id.toString(),
            isSeen: false
        }));

        await notificationService.bulkNotificationInsertAndEmit(request.io, notifications);

        return response.success("Newsletter added successfully", newsletter)
    } catch (error) {
        logError(error, {
            api: "addNewsLetter",
            req: request
        })
        return response.error(error)
    }
}
module.exports = addNewsLetter;