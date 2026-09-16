const areaPriceTrendService = require("../../services/area-price-trend.service");
const countAverageRate = require("../../utils/helper/count-average-rate");
const logError = require("../../utils/helper/pino-log-error");
const { updateAreaPriceTrendValidationSchema } = require("../../validation/area-price-trend-validation");

const updateAddAreaPriceTrends = async (request, response) => {
    try {
        //extract data from request body
        const {priceTrendId, city, area, priceTrends } = request.body;

        //check validation
        const { value, error } = await updateAreaPriceTrendValidationSchema.validate({priceTrendId, city, area, priceTrends }, { abortEarly: true });
        if (error) {
            const formattedMessage = error?.details
                .map(err => `(${err.path.join('.')}) ${err.message}`)
                .join(' | ');
            return response.validationError(formattedMessage)
        };

        //check price trend is repeat or not
        const monthSet = new Set();
        for (const trend of priceTrends) {
            const monthKey = `${trend.year}-${trend.month}`;

            if (monthSet.has(monthKey)) {
                return response.badRequest(`Price trend in month '${trend.month}' is already added for year '${trend.year}'.`)
            }
            monthSet.add(monthKey);
        }

        const trends = await areaPriceTrendService.getAreaPriceTrendById(priceTrendId);
        if (!trends) {
            return response.notFound("Record not found")
        }

        //check price trend already exist or not for current city location
        const isAreaExist = await areaPriceTrendService.getAreaTrendByNameWhileUpdate(priceTrendId, city, area)
        if (isAreaExist) {
            return response.badRequest(`Price trends already exist for ${area}`)
        }

        const sortedArray = priceTrends.sort((a, b) => {
            // Compare years first
            if (a.year !== b.year) {
                return a.year - b.year;
            }

            // If years are the same, compare months
            return a.monthValue - b.monthValue;
        })
        //calculate average appreciation rate of city
        const trendPercentage = await countAverageRate(sortedArray)
        const dataToUpdate = {
            area: value.area,
            city : value.city,
            priceTrends: sortedArray,
            trendPercentage,
            isIncrease: trendPercentage < 0 ? false : true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        //insert data into database and send response to client
        const result = await areaPriceTrendService.updateAddAreaPriceTrends(priceTrendId, dataToUpdate);
        if (result?.acknowledged && result.modifiedCount > 0) {
            return response.ok("Price trends updated successfully")
        } else {
            return response.badRequest('Failed to update area price trend')
        }
    } catch (error) {
        console.log(error.message)
        // store log in error.log file
        logError(error, {
            api: 'updateAddAreaPriceTrends',
            req: request,
        });
        return response.error(error);  
    }
};

module.exports = updateAddAreaPriceTrends;