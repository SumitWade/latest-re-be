const localityService = require("../../services/locality.service");
const logError = require("../../utils/helper/pino-log-error");

const markLocalityActiveInactive = async (req, res) => {
    try {
        const { id } = req.body;
        console.log(id, "id-------------")
        const locality = await localityService.getLocalityById(id);
        if (!locality) {
            return res.notFound("Locality not found");
        }
        console.log(locality, "locality-------------")
        // check locality exists
        const isLocalityExist = await localityService.getLocalityById(id);
        if (!isLocalityExist) {
            return res.notFound("Locality not found");
        }
        console.log(isLocalityExist, "isLocalityExist-------------")
        const isActive = !isLocalityExist?.isActive;
        const dataToUpdate = {
            isActive: isActive
        };
        const result = await localityService.updateLocalityDetails(id, dataToUpdate);
        if (result?.modifiedCount > 0) {
            return res.success(isActive ? "Locality marked as active successfully" : "Locality marked as inactive successfully", {
                isActive: isActive
            });
        } else {
            return res.error("Failed to mark locality as active/inactive");
        }
    } catch (error) {
        logError(error, {
            api: 'markLocalityActiveInactive',
            req: req,
        });
        return res.error(error);
    }
};

module.exports = markLocalityActiveInactive;