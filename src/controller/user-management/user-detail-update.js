const runMiddleware = require("../../middlewares/multer-middleware");
const notificationService = require("../../services/notification.service");
const userServices = require("../../services/user.service");
const logError = require("../../utils/helper/pino-log-error");
const uploadSingleImage = require("../../utils/multer/upload-image");
const { userRegistrationValidation, userDetailUpdateValidation } = require("../../validation/user-validation");

const userDetailUpdate = async (request, response) => {
    try {
        //upload file
        const fileResponse = await runMiddleware(request, response, uploadSingleImage.single("profile"));
        if(fileResponse){
            return response.status(400).json({
                status: "FAILED",
                message: fileResponse?.code
            })
        }

        //Extract data from the request body
        const {id, name, email, mobile, address, state, city, pinCode} = request.body;

        //validation 
        const {value, error} = userDetailUpdateValidation.validate({id, name, email, mobile, address, state, city, pinCode}, {abortEarly: true});
        if (error) {
            const formattedMessage = error?.details
                .map(err => `(${err.path.join('.')}) ${err.message}`)
                .join(' | ');
            return response.validationError(formattedMessage)
        };

        //check if the user exist or not
        const isRecordExist = await userServices.getUserByObjectId(id);
        if(!isRecordExist){
            return response.notFound("User record not found")
        };

        //check if the user already register 
        const isUserExist = await userServices.checkMobileWhileUpdate(value.id, value.mobile);
        const maskedMobile = "*".repeat(value.mobile.length - 4) + value.mobile.slice(-4);        
        if(isUserExist) {
            return response.conflict(`Registration already exists with this (${maskedMobile}) mobile number!`)
        };

        //check if the user already exist with the same email while update
        const isUserEmailExist = await userServices.isUserEmailExistWhileUpdate(value.id, value.email);
        if(isUserEmailExist){
            return response.conflict("Email address already exist")
        };

        //check if the mobile number is verified or not
        if(isRecordExist.isMobileVerified == false){
            return response.badRequest("Please verify the mobile")
        };

        //getFile path
        let fileUrl = "";
        let file = request?.file;
        if (!!file) {
            const splitUrlArray = file?.destination.split("/");
            fileUrl = splitUrlArray[splitUrlArray.length - 3] + '/' + splitUrlArray[splitUrlArray.length - 2] + '/' + splitUrlArray[splitUrlArray.length - 1] + file?.filename;
        };

        // Update data format
        const dataToUpdate = {
            userType: value.type,
            name : value.name,
            email : value.email,
            mobile : value.mobile,
            address : value.address, 
            state: value.state, 
            city: value.city, 
            pinCode : value.pinCode,
            profile: fileUrl || (isRecordExist?.profile ? isRecordExist?.profile : "")
        };

        //save data into db and send response
        const result = await userServices.updateUser(id, dataToUpdate);
        if (result.acknowledged && result.modifiedCount > 0) {
            //success response
            return response.ok("Details updated successfully.");
        } else {
            return response.badRequest("Failed to update, Please try again later.");
        }

    } catch (error) {
        console.log(error.message)
        // store log in error.log file
        logError(error, {
            api: 'userDetailUpdate',
            req: request,
        });
        return response.error(error);
    };
};

module.exports = userDetailUpdate;

