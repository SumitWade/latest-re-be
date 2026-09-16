const areaPriceTrendService = require("../../services/area-price-trend.service");
const logError = require("../../utils/helper/pino-log-error");

const detailedAreaPriceTrendForPublic = async (request, response) => {
    try {
        //extract data from the request body
        const {id, year} = request.body;
        const currentYear = new Date().getFullYear();

        //get data 
        const setYear = year ? String(year) : String(currentYear);
        const result  = await areaPriceTrendService.detailedAreaPriceTrendForPublic(id, setYear);
        if(result){
            return response.status(200).json({
                status: "SUCCESS",
                message: "Data fetched successfully",
                result 
            })
        } else {
            return response.badRequest("Data not found")
        }
    } catch (error) {
        // store log in error.log file
        logError(error, {
            api: 'detailedAreaPriceTrendForPublic',
            req: request,
        });
        return response.error(error); 
    }
};

module.exports = detailedAreaPriceTrendForPublic;