const Locality = require("../model/locality.model");

const localityService = {
    addMultipleLocalities: async (validLocalities) => {
        return await Locality.insertMany(validLocalities, { ordered: false });
    },
    findLocalitiesByNames: async (names) => {
        return await Locality.find({ name: { $in: names } });
    },
    getAllActiveLocalities: async () => {
        return await Locality.find({ isActive: true })
    },
    getAllLocalities: async () => {
        return await Locality.find({});
    },
    getLocalityById: async (id) => {
        const locality = await Locality.findById(id);
        if (!locality) {
            return res.notFound("Locality not found");
        }
        return locality;
    },
    getLocalityById: async (id) => {
        return await Locality.findById(id);
    },
    deleteLocalityById: async (id) => {
        return await Locality.deleteOne({ _id: id });
    },
    updateLocalityDetails: async (id, data) => {
        return await Locality.updateOne({ _id: id }, { $set: data });
    },
    getLocalitiesByCity: async (city) => {
        return await Locality.find({ city: city }, { name: 1, _id: 1, city: 1, latitude: 1, longitude: 1 });
    },
    getCityList: async () => {
        return await Locality.find({}).distinct('city');
    }
};
module.exports = localityService;