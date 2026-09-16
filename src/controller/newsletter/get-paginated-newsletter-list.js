const newsletterService = require("../../services/newsletter.service")
const logError = require("../../utils/helper/pino-log-error")

const getNewsletterList = async (request, response) => {
    try {
        const { searchString, page } = request.body
        const result = await newsletterService.getNewsletterList(searchString, page)
        if (!result) {
            return response.notFound("No newsletter found")
        }
        return response.paginated(result.result, result.totalPages, result.totalRecords)
    } catch (error) {
        logError(error, {
            api: "getNewsletterList",
            req: request
        })
        return response.error(error)
    }
}
module.exports = getNewsletterList;