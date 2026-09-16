const mongoose = require("mongoose");

const projectEnquirySchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status : {
        type : String,
        enum : ["Pending", "Contacted", "Completed"],
        default : "Pending"
    }
}, {
    timestamps: true
});

const ProjectEnquiry = mongoose.model("ProjectEnquiry", projectEnquirySchema);

module.exports = ProjectEnquiry;