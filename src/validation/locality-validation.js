const Joi = require('joi');

const localitySchema = Joi.object({
    name: Joi.string().required(),
    city: Joi.string().optional().default("Nagpur"),
    latitude: Joi.number().required(),
    longitude: Joi.number().required()
});

const addBulkLocalitiesSchema = Joi.array().items(localitySchema);

module.exports = {
    addBulkLocalitiesSchema
};
