const areaPriceTrendService = require("../../services/area-price-trend.service");
const countAverageRate = require("../../utils/helper/count-average-rate");
const logError = require("../../utils/helper/pino-log-error");
const { addAreaPriceTrendValidationSchema } = require("../../validation/area-price-trend-validation");

const addAreaPriceTrends = async (request, response) => {
    try {
        //extract data from request body
        const { city, area, priceTrends } = request.body;

        //check validation
        const { value, error } = await addAreaPriceTrendValidationSchema.validate({ city, area, priceTrends }, { abortEarly: true });
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

        //check price trend already exist or not for current city location
        const isAreaExist = await areaPriceTrendService.getAreaTrendByName(city, area)
        if (isAreaExist) {
            return response.status(400).json({
                status: 'FAILED',
                message: `Price trends already exist for ${area}`
            });
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
        const dataToInsert = {
            area: value.area,
            city : value.city,
            priceTrends: sortedArray,
            trendPercentage,
            isIncrease: trendPercentage < 0 ? false : true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        //insert data into database and send response to client
        const result = await areaPriceTrendService.addAreaPriceTrends(dataToInsert);
        
        if (result?._id) {
            return response.ok("Price trends added successfully")
        } else {
            return response.badRequest('Failed to add area price trend')
        }
    } catch (error) {
        console.log(error.message)
        // store log in error.log file
        logError(error, {
            api: 'addAreaPriceTrends',
            req: request,
        });
        return response.error(error);  
    }
};

module.exports = addAreaPriceTrends;