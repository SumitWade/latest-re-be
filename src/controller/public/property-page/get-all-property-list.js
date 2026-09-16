const propertyServices = require("../../../services/property.service");


const getAllPropertyList = async (request, response) => {
    try {
        const { page = 1, ...filters } = request.body;
    
        const result = await propertyServices.getPublicPropertyList(page, filters);
        if (result) {
            return response.success("Data Fetch Successfully", result);
        } else {
            return response.error("No property found");
        }
    } catch (error) {
        console.log(error.message)
        return response.error(error);
    }
}

module.exports = getAllPropertyList;