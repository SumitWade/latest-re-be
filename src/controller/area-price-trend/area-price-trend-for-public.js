const areaPriceTrendService = require("../../services/area-price-trend.service");
const logError = require("../../utils/helper/pino-log-error");

const calculateTrend = (priceTrends) => {

    if (priceTrends.length < 2) {
        return {
            trendPercentage: 0,
            isIncrease: true
        };
    }

    const first = priceTrends[0].price;
    const last = priceTrends[priceTrends.length - 1].price;

    const trend = ((last - first) / first) * 100;

    return {
        trendPercentage: Number(trend.toFixed(2)),
        isIncrease: trend >= 0
    };
};

const areaPriceTrendForPublic = async (request, response) => {
    try {
        //Extract data from the request body
        const {city, propertyCategory} = request.body;
        console.log(request.body)
        //get data from db and send response to client
        const result = await areaPriceTrendService.getAreaPriceTrend(city, propertyCategory);
        const finalData = result.map(item => {
            const trend = calculateTrend(item.priceTrends);
            return {
                ...item,
                trendPercentage: trend.trendPercentage,
                isIncrease: trend.isIncrease
            };
        });

        if (result?.length > 0) {
            return response.status(200).json({
                status: 'SUCCESS',
                message: 'Data fetch successfully',
                result : finalData
            })
        } else {
            return response.status(400).json({
                status: 'FAILED',
                message: 'Data not available'
            })
        }
    } catch (error) {
        // store log in error.log file
        logError(error, {
            api: 'areaPriceTrendForPublic',
            req: request,
        });
        return response.error(error); 
    }
};

module.exports = areaPriceTrendForPublic;
