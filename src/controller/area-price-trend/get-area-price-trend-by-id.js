const areaPriceTrendService = require("../../services/area-price-trend.service");
const logError = require("../../utils/helper/pino-log-error");
const { idValidation } = require("../../validation/common-validation");

const getAreaTrendById = async (request, response) => {
    try {
        //extract data from body
        const id = request.body.id;

        //check validation
        const validationResult = await idValidation.validate({ id }, { abortEarly: true });
        if (validationResult.error) {
            response.status(400).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message,
            });
            return;
        }

        //get trends details from db and send response to client
        const result = await areaPriceTrendService.getAreaPriceTrendById(id);
        if (result) {
            return response.status(200).json({
                status: 'SUCCESS',
                message: 'Data fetch successfully',
                result
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
            api: 'getAreaTrendById',
            req: request,
        });
        return response.error(error); 
    }
};

module.exports = getAreaTrendById;