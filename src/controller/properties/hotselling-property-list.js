const propertyServices = require("../../services/property.service");
const logError = require("../../utils/helper/pino-log-error");

const hotSellingPropertyList = async (request, response) => {
    try {
        //Extract data of hot selling property
        const result = await propertyServices.hostSellingPropertyList();
        const topProperties = result
            .filter(item => item.totalCount >= 1 || item.isHotsellingProperty)
            .sort((a, b) => {
                if (a.isHotsellingProperty && !b.isHotsellingProperty) return -1;
                if (!a.isHotsellingProperty && b.isHotsellingProperty) return 1;
                return b.totalCount - a.totalCount;
            })
            .slice(0, 5);

        if(topProperties.length > 0){
            return response.success("Data fetched successfully", topProperties)
        }else {
            return response.notFound("No record found")
        }
    } catch (error) {
        logError(error, {
            api: "hotSellingPropertyList",
            req: request
        });
        return response.error(error);
    }
};

module.exports = hotSellingPropertyList;