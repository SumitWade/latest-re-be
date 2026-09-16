const propertyServices = require("../../services/property.service");
const logError = require("../../utils/helper/pino-log-error");

const getTrendingProperties = async (request, response) => {
    try {
        const { page, searchString } = request.query;
        const properties = await propertyServices.getTrendingProperties(page, searchString);
        if (!properties.result.length) {
            return response.notFound("Properties not found");
        }
        return response.paginated(properties.result, properties.totalPages, properties.totalRecords);
    } catch (error) {
        logError(error, {
            api: 'getTrendingProperties',
            req: request,
        });
        return response.error(error);
    }
};

module.exports = getTrendingProperties;