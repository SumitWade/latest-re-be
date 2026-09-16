const addProject = require('../controller/projects/add-project');
const addProjectEnquiry = require('../controller/projects/add-project-enquiry');
const approveOrRecheckProjectUpdate = require('../controller/projects/approve-recheck-project-update');
const changeProjectEnquiryStatus = require('../controller/projects/change-project-enquiry-status');
const getAllProjectList = require('../controller/projects/get-all-project-list');
const getProjectByObjId = require('../controller/projects/get-project-by-obj-id');
const getEnquiryPaginatedList = require('../controller/projects/get-project-enquiry-paginated-list');
const getProjectForApproval = require('../controller/projects/get-project-for-approval');
const markProjectActiveInactive = require('../controller/projects/mark-project-active-inactive');
const markProjectAsVerified = require('../controller/projects/mark-project-as-verified');
const projectPaginatedList = require('../controller/projects/project-paginated-list');
const updateProjectDetails = require('../controller/projects/update-project');
const getPublicProjectById = require('../controller/public/project-page/public-project-by-id');
const getPublicProjectList = require('../controller/public/project-page/public-project-list');
const userAuthentication = require('../middlewares/auth');

const projectRoutes = require('express').Router();

projectRoutes.post("/add-project", userAuthentication, addProject)
projectRoutes.post("/update-project", userAuthentication, updateProjectDetails)
projectRoutes.post("/get-project-for-approval", userAuthentication, getProjectForApproval)
projectRoutes.post("/project-paginated-list", userAuthentication, projectPaginatedList)
projectRoutes.post("/get-project-by-obj-id", getProjectByObjId)
projectRoutes.post("/approve-recheck-project", userAuthentication, approveOrRecheckProjectUpdate)
projectRoutes.post("/mark-project-active-inactive", userAuthentication, markProjectActiveInactive)
projectRoutes.get("/get-all-project-list", userAuthentication, getAllProjectList)

// public routes
projectRoutes.post("/get-all-public-project-list", getPublicProjectList)
projectRoutes.post("/get-public-project-by-id", getPublicProjectById)

// enquiry routes
projectRoutes.post("/add-project-enquiry", userAuthentication, addProjectEnquiry)
projectRoutes.post("/get-project-enquiry-paginated-list", userAuthentication, getEnquiryPaginatedList)
projectRoutes.post("/change-project-enquiry-status", userAuthentication, changeProjectEnquiryStatus)

// mark project as verified
projectRoutes.post("/mark-project-as-verified", userAuthentication, markProjectAsVerified)



module.exports = projectRoutes;