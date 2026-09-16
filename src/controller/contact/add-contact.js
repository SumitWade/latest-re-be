const { addContactValidation } = require("../../validation/common-validation");
const logError = require("../../utils/helper/pino-log-error");
const contactService = require("../../services/contact.service");
const notificationService = require("../../services/notification.service");

const addContact = async (request, response) => {
    try {
        const { name, email, phone, message } = request.body;
        const { value, error } = addContactValidation.validate({ name, email, phone, message })
        // validate user input
        if (error) {
            const formattedMessage = error?.details
                .map(err => `(${err.path.join('.')}) ${err.message}`)
                .join(' | ');
            return response.validationError(formattedMessage)
        }
        // // check email alredy exists
        // const existingEmail = await contactService.getContactByEmail(email);
        // if (existingEmail) {
        //     return response.error("Email already exists");
        // }
        // create the recod
        const data = { name, email, phone, message };
        const result = await contactService.createContact(data)
        // NOTIFY FOR CONTACT DETAILS ARE ADDED
        const notificationData = {
            title: "New Contact Added",
            description: `New contact added By "${name}"`,
            model: "contact",
            link: '/admin/contact-enquiries',
            notificationFor: "6a3ce13db0679dce1b12ea1d",
            createdBy: request?._id || null,
            recordId: result._id ? result._id.toString() : null,
            isSeen: false
        };
        if (request.io) {
            await notificationService.createNotificationAndEmit(request.io, notificationData);
        } else {
            await notificationService.addNotification(notificationData);
        }

        return response.success("Contact created successfully", result);



    } catch (error) {
        console.log(error.message);
        logError(error, {
            api: "addContact",
            req: request
        });
        return response.error(error);
    }
}

module.exports = addContact;