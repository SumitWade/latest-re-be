const areaPriceTrendService = require("../../services/area-price-trend.service");
const logError = require("../../utils/helper/pino-log-error");

const paginatedAreaTrendList = async (request, response) => {
    try {
        const { searchString, page } = request.body;
        //get data from db and send response to client
        const result = await areaPriceTrendService.paginatedAreaTrendList(searchString, page);
        if (result?.totalPages > 0) {
            return response.status(200).json({
                status: 'SUCCESS',
                message: 'Price trend fetch successfully',
                ...result
            })
        } else {
            return response.status(400).json({
                status: 'FAILED',
                message: 'Price trend not available'
            })
        }
    } catch (error) {
        // store log in error.log file
        logError(error, {
            api: 'paginatedAreaTrendList',
            req: request,
        });
        return response.error(error);  
    }
};

module.exports = paginatedAreaTrendList;