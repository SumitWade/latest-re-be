function compareProjectData(oldData = {}, newData = {}) {

    const comparison = {};

    const skipFields = [
        "_id",
        "__v",
        "createdAt",
        "updatedAt",
        "location",
        "developerId",
        "propertyId",
        "developerName",
        "rank",
        "isActive",
        "adminRemarks",
        "approvedBy",
        "approvedAt",
        "reviewHistory",
        "virtualTourUrl",
        "showToPublic",
        "approvedByAdmin",
        "remark",
        "createdBy",
        "featured",
        "likedBy",
        "isDeleted",
        "threeSixtyView",
        "virtualTour",
        "gallery",
        "floorPlans",
        "brochure",
        "hotSelling",
        "status",
        "isVastuDone"
    ];

    const keys = new Set([
        ...Object.keys(oldData),
        ...Object.keys(newData)
    ]);

    keys.forEach(key => {

        if (skipFields.includes(key)) return;

        const oldValue = oldData[key];
        const newValue = newData[key];

        const changed =
            JSON.stringify(oldValue) !== JSON.stringify(newValue);

        if (changed) {
            comparison[key] = {
                changed: true,
                oldValue,
                newValue
            };
        }

    });

    return comparison;
}

module.exports = compareProjectData;