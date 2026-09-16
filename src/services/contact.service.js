const Contact = require("../model/contact.model");
const countPages = require("../utils/helper/count-pages");
const limit = 20;
const contactService = {
    createContact: async (data) => {
        const contact = new Contact(data);
        return await contact.save();
    },
    getAllContacts: async (page = 1, searchString = "") => {
        try {
            if (page < 1) page = 1;

            const skip = (page - 1) * limit;

            let filter = {};
            if (searchString) {
                const regex = new RegExp(searchString.trim(), "i");
                filter = { $or: [{ name: regex }, { email: regex }, { phone: regex }, { message: regex }] };
            }

            const totalRecords = await Contact.countDocuments(filter);
            const result = await Contact.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean();

            if (!result) {
                return false;
            }

            return {
                result,
                totalPages: await countPages(totalRecords),
                totalRecords: totalRecords,
            };

        } catch (error) {
            throw error;
        }
    },
    getContactByEmail: async (email) => {
        return await Contact.findOne({ email });
    },
    changeStatusOfContactEnquiries: async (id, status) => {
        try {
            return await Contact.findByIdAndUpdate(id, { $set: { status: status } }, { new: true });
        } catch (error) {
            throw error;
        }
    }

}
module.exports = contactService;