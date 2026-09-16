const PropertyEnquiry = require('../model/property-enquiry.model');
const Property = require('../model/property.model');
const countPages = require('../utils/helper/count-pages');
const limit = process.env.LIMIT || 20
const propertyEnquiryService = {
    addPropertyEnquiry: async (data) => {
        return await PropertyEnquiry.create(data);
    },
    getPropertyEnquiryById: async (id) => {
        return await PropertyEnquiry.findById(id);
    },
    getPropertyEnquiryList: async (searchString, page) => {
        const filter = {};
        if (searchString) {
            filter.name = { $regex: searchString, $options: "i" };
        }
        //set pagination to default one
        if (page < 1) page = 1;

        const skip = (page - 1) * limit;
        const totalRecords = await PropertyEnquiry.countDocuments(filter);
        const result = await PropertyEnquiry.find(filter)
            .populate('userId', '_id')
            .populate('propertyId', 'propertyTitle')
            .skip(skip).limit(limit).sort({ createdAt: -1 })
        if (!result) {
            return false;
        }
        return {
            result,
            totalPages: await countPages(totalRecords),
            totalRecords: totalRecords
        };
    },
    getDeveloperEnquiryList: async (searchString, page, developerId) => {
        try {
            const filter = {}
            if (searchString) {
                filter.name = { $regex: searchString, $options: "i" };
            }

            // Get all properties created by this developer
            const developerProperties = await Property.find({ createdBy: developerId }).select('_id');
            const propertyIds = developerProperties.map(p => p._id);

            // Filter enquiries by the developer's property IDs
            filter.propertyId = { $in: propertyIds };

            //set pagination to default one
            if (page < 1) page = 1;

            const skip = (page - 1) * limit;
            const totalRecords = await PropertyEnquiry.countDocuments(filter);
            const result = await PropertyEnquiry.find(filter)
                .populate('userId', '_id')
                .populate('propertyId', 'propertyTitle createdBy')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            if (!result) {
                return false;
            }
            return {
                result,
                totalPages: await countPages(totalRecords),
                totalRecords: totalRecords
            };
        } catch (error) {
            throw error
        }
    },
    findByIdAndUpdate: async (id, data) => {
        return await PropertyEnquiry.findByIdAndUpdate(id, {
            $set: { status: data.status }
        }, { new: true })
    }
}

module.exports = propertyEnquiryService;