const mongoose = require("mongoose");

const projectUpdateRequestSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        index: true
    },
    developerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    developerName: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["pending", "approved", "recheck"],
        default: "pending"
    },
    // Latest draft
    projectData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    // Approved project when request was first created
    projectSnapshot: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    adminRemarks: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

projectUpdateRequestSchema.index(
    { projectId: 1, status: 1 },
    {
        unique: true,
        partialFilterExpression: {status: "pending"}
    }
);

const ProjectUpdateRequest = mongoose.model("ProjectUpdateRequest", projectUpdateRequestSchema);
module.exports = ProjectUpdateRequest;