const propertyServices = require("../../../services/property.service");

const getPropertyById = async (request, response) => {
    try {
        const { id } = request.body;

        const result = await propertyServices.getPropertyById(id)

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

module.exports = getPropertyById;