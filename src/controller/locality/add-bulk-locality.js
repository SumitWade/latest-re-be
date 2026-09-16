const localityService = require("../../services/locality.service");
const logError = require("../../utils/helper/pino-log-error");
const { addBulkLocalitiesSchema } = require("../../validation/locality-validation");

const addBulkLocalities = async (req, res) => {
    try {
        const { localities } = req.body;
        if (!localities || !Array.isArray(localities) || localities.length === 0) {
            return res.badRequest("Invalid localities array provided.");
        }
        const { value, error } = addBulkLocalitiesSchema.validate(localities, { abortEarly: false });
        if (error) {
            const formattedMessage = error?.details
                .map(err => `(${err.path.join('.')}) ${err.message}`)
                .join(' | ');
            return res.validationError(formattedMessage);
        }

        // Check if any of the localities already exist in the database
        const namesToCheck = value.map(loc => loc.name);
        const existingLocalities = await localityService.findLocalitiesByNames(namesToCheck);

        if (existingLocalities.length > 0) {
            const existingNames = existingLocalities.map(loc => loc.name);
            return res.conflict(`The following localities already exist: ${existingNames.join(', ')}`);
        }

        const addedLocalities = await localityService.addMultipleLocalities(value);
        return res.success("Localities added successfully.", addedLocalities);
    } catch (error) {
        if (error.name === 'BulkWriteError' || error.code === 11000) {
            return res.status(207).json({
                status: "PARTIAL_SUCCESS",
                message: "Some localities were added, but some failed (likely due to duplicate names).",
                insertedCount: error.insertedDocs ? error.insertedDocs.length : 0,
                errorDetails: error.writeErrors ? error.writeErrors.map(e => e.errmsg) : error.message
            });
        }
        logError(error, {
            api: 'addBulkLocalities',
            req: req,
        });
        return res.error(error);
    }
};
module.exports = addBulkLocalities;