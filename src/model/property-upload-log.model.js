const mongoose = require("mongoose");

const propertyBulkUploadLogSchema = new mongoose.Schema(
{
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    fileName: {
        type: String,
        default: ""
    },
    totalRecords: {
        type: Number,
        default: 0
    },
    successCount: {
        type: Number,
        default: 0
    },
    failedCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["SUCCESS", "PARTIAL_SUCCESS", "FAILED"],
        default: "SUCCESS"
    },
    successRecords: [{
        sheet: String,
        row: Number,
        propertyTitle: String
    }],
    failedRecords: [{
        sheet: String,
        row: Number,
        propertyTitle: String,
        reason: String
    }]
},
{
    timestamps: true
});

 const PropertyBulkUploadLog = mongoose.model("PropertyBulkUploadLog", propertyBulkUploadLogSchema);
 module.exports = PropertyBulkUploadLog;