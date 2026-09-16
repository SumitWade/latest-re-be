const Newsletter = require('../model/newsletter');
const countPages = require('../utils/helper/count-pages');
const limit = 20;
const newsletterService = {
    addNewsLetter: async (data) => {
        try {
            return await Newsletter.create(data)
        } catch (error) {
            throw error
        }
    },
    getNewsletterByEmail: async (email) => {
        try {
            return await Newsletter.findOne({ email })
        } catch (error) {
            throw error
        }
    },
    getNewsletterList: async (searchString, page) => {
        try {
            if (page < 1) page = 1;

            const skip = (page - 1) * limit;

            let filter = {};

            if (searchString && searchString.trim() !== "") {
                const regex = new RegExp(searchString.trim(), "i");
                filter = { $or: [{ name: regex }, { email: regex }] };
            }

            const totalRecords = await Newsletter.countDocuments(filter);
            const result = await Newsletter.find(filter)
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
            throw error
        }
    }

}
module.exports = newsletterService;