const propertyServices = require("../../services/property.service")
const logError = require("../../utils/helper/pino-log-error")

const housingTopPicks = async (request, response) => {
    try {
        const result = await propertyServices.getHousingTopPicks()
        if (result) {
            return response.success("Housing top picks fetched successfully", result)
        } else {
            return response.notFound("Housing top picks not found")
        }
    } catch (error) {
        logError(error, {
            api: "",
            req: request,
        })
    }
}
module.exports = housingTopPicks;
