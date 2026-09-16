function comparePropertyData(oldData = {}, newData = {}) {

    const comparison = {};

    const skipFields = [
        "_id",
        "__v",
        "createdAt",
        "updatedAt",

        // References
        "projectId",

        // Approval/Admin fields
        "isActive",
        "status",
        "approvedBy",
        "approvedAt",
        "approvedByAdmin",
        "adminRemarks",
        "reviewHistory",
        "remark",
        "createdBy",
        "showToPublic",
        "featured",
        "likedBy",
        "isDeleted",
        "isVerified",
        "location",
        "reviews",
        "hotSelling",

        // File fields
        "gallery",
        "floorPlans",
        "brochure",
        "virtualTour",
        "threeSixtyView",
        "allUploadedFiles"
    ];

    const keys = new Set([
        ...Object.keys(oldData || {}),
        ...Object.keys(newData || {})
    ]);

    keys.forEach((key) => {

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

module.exports = comparePropertyData;