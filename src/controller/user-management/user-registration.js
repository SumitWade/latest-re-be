const notificationService = require("../../services/notification.service");
const userServices = require("../../services/user.service");
const logError = require("../../utils/helper/pino-log-error");
const { userRegistrationValidation } = require("../../validation/user-validation");

const userRegistration = async (request, response) => {
    try {
        //Extract data from the request body
        const {name, email, mobile, type} = request.body;

        //validation 
        const {value, error} = userRegistrationValidation.validate({name, email, mobile, type}, {abortEarly: true});
        if (error) {
            const formattedMessage = error?.details
                .map(err => `(${err.path.join('.')}) ${err.message}`)
                .join(' | ');
            return response.validationError(formattedMessage)
        };

        //check if the user already register 
        const isUserExist = await userServices.isUserExistWithMobile(value.mobile);
        const maskedMobile = "*".repeat(value.mobile.length - 4) + value.mobile.slice(-4);        
        if(isUserExist) {
            return response.conflict(`Registration already exists with this (${maskedMobile}) mobile number!`)
        };

        //check if the user already exist with the same email
        const isUserEmailExist = await userServices.isUserExistWithEmail(value.email);
        if(isUserEmailExist){
            return response.conflict("Email address already exist")
        }

        // insert data format
        const dataToInsert = {
            userType: value.type,
            name : value.name,
            email : value.email,
            mobile : value.mobile,
        };

        // Get admin users
        let adminUsers = await userServices.getAdminUsers();

        // Create default admin if none exists
        if (!adminUsers.length) {
            const admin = await userServices.createDefaultAdmin();
            adminUsers = [admin];
        };

        //save data into db and send response
        const result = await userServices.insertUser(dataToInsert);
        if (result._id) {
            //add notification
            const notifications = adminUsers.map((admin) => ({
                title: "New Registration",
                description: `New user registration as a ${value.type}`,
                model: "user",
                notificationFor: admin._id,
                isSeen: false
            }));

            // Send notification to all admins
            await notificationService.bulkNotificationInsertAndEmit(request.io, notifications );
            //success response
            return response.ok("Registration completed successfully.");

        } else {
            return response.badRequest("Failed to register, Please try again later.");
        }

    } catch (error) {
        console.log(error.message)
        // store log in error.log file
        logError(error, {
            api: 'userRegistration',
            req: request,
        });
        return response.error(error);
    };
};

module.exports = userRegistration;

