const runMiddleware = require("../../middlewares/multer-middleware");
const User = require("../../model/user.model");
const notificationService = require("../../services/notification.service");
const projectServices = require("../../services/project.service");
const subscriptionPlanService = require("../../services/subscription-plan.service");
const userServices = require("../../services/user.service");
const deleteUploadedFileFolder = require("../../utils/helper/delete-file-folder");
const deleteMultipleFiles = require("../../utils/helper/delete-multiple-file");
const getUploadedFilesUrl = require("../../utils/helper/get-uploaded-files-url");
const logError = require("../../utils/helper/pino-log-error");
const validateFileSize = require("../../utils/multer/check-file-size");
const uploadImageVideoPdfImages = require("../../utils/multer/upload-image-pdf-video");
const { addProjectValidationSchema } = require("../../validation/project-validation");
const mongoose = require("mongoose");
const projectId = new mongoose.Types.ObjectId();

//------------------Add-project-controller--------------------
const addProject = async (request, response) => {
    try {
        // Generate new Project Id for every request
        const projectId = new mongoose.Types.ObjectId();
        const folderName = projectId.toString();  //property id in string for folder
        request.projectId = projectId;
        request.folderName = folderName

        //upload video and file
        const fileResponse = await runMiddleware(request, response, uploadImageVideoPdfImages.any())
        if (fileResponse) {
            return response.status(400).json({
                status: "FAILED",
                message: fileResponse.code,
            });
        }

        //check file limit should not be greater than the 2MB or 10MB
        const validation = validateFileSize(request.files);
        if (!validation.isValid) {
            await deleteUploadedFileFolder(folderName); // upload directory path
            return response.badRequest(validation.message);
        }

        //Extract data from the request body
        let projectData;
        if (request.body && typeof request.body.projectData === 'string') {
            projectData = JSON.parse(request.body.projectData);
        } else {
            projectData = request.body;
        }
        const { id, purchaseId } = request


        //extract data from request body
        const {
            name,
            reraNumber,
            projectType,
            constructionStatus,
            vastuCompliance,
            totalTower,
            totalUnit,
            address,
            city,
            state,
            zipCode,
            locality,    //landmark
            latitude,
            longitude,
            startDate,
            possessionDate,
            description,
            amenities,
            isVastuDone,
            //new key
            currentNearLocation
        } = projectData;

        //check validation
        const { value, error } = await addProjectValidationSchema.validate({
            name,
            reraNumber,
            projectType,
            constructionStatus,
            vastuCompliance,
            totalTower,
            totalUnit,
            address,
            city,
            state,
            zipCode,
            locality,    //landmark
            latitude,
            longitude,
            startDate,
            possessionDate,
            description,
            amenities,
            isVastuDone,
            //new key
            currentNearLocation
        }, { abortEarly: true });
        if (error) {
            await deleteUploadedFileFolder(folderName); // upload directory path
            const formattedMessage = error?.details
                .map(err => `(${err.path.join('.')}) ${err.message}`)
                .join(' | ');
            return response.validationError(formattedMessage)
        };

        //get the purchase details 
        const purchaseDetails = await subscriptionPlanService.getPurchasedSubscriptionDetails(id);
        //check if the property listing limit reach
        if(purchaseDetails && purchaseDetails.projectLimit == 0){
            await deleteUploadedFileFolder(folderName); // upload directory path
            return response.badRequest("Your project listing limit exhausts")
        };

        let searchPriority = 0;
        let verifiedBadge = false;
        let homepageFeatured = false;

        if (purchaseDetails?.planId) {
            searchPriority = purchaseDetails.planId.searchPriority || 0;
            verifiedBadge = purchaseDetails.planId.verifiedBadge || false;
            homepageFeatured = purchaseDetails.planId.homepageFeatured || false;
        }

        //check developer exist or not
        const isDeveloperExist = await userServices.getUserByObjectId(id);
        if (!isDeveloperExist) {
            await deleteUploadedFileFolder(folderName); // upload directory path
            return response.notFound("User record not exist")
        };

        //check project for particular user already exist or not
        const isProjectExist = await projectServices.checkProjectNameUnderDeveloper(id, value.name);
        if (isProjectExist) {
            await deleteUploadedFileFolder(folderName); // upload directory path
            return response.badRequest(`Project name (${name}) already exist`)
        };

        //extract file from request 
        const files = request.files
        const filesArray = await getUploadedFilesUrl(files, []);

        const allFiles = Object.values(filesArray).flat();

        //gallery
        const gallery = filesArray.gallery || [];
        if (gallery.length < 3) {
            await deleteUploadedFileFolder(folderName); // upload directory path
            return response.badRequest("Please upload at least 3 gallery images.");
        }
        if (gallery.length > 10) {
            await deleteUploadedFileFolder(folderName); // upload directory path
            return response.badRequest("You can upload a maximum of 10 gallery images.");
        }
        const virtualtour = filesArray.virtualtour || [];

        const threesixty = filesArray.threesixty || [];

        const brochure = filesArray.brochure?.[0].fileUrl || null;
        if (!filesArray.brochure?.length) {
            await deleteUploadedFileFolder(folderName); // upload directory path
            return response.badRequest("Brochure file is required.");
        }

        const floorplan = filesArray.floorplan?.[0].fileUrl || null;
        if (!filesArray.floorplan?.length) {
            await deleteUploadedFileFolder(folderName); // upload directory path
            return response.badRequest("Floor plan file is required.");
        }

        const dataToInsert = {
            _id: projectId,
            name: value.name,
            developerId: id,
            developerName: isDeveloperExist?.name,
            reraNumber: value.reraNumber,
            projectType: value.projectType,
            constructionStatus: value.constructionStatus,
            vastuCompliance: value.vastuCompliance,
            totalTower: value.totalTower,
            totalUnit: value.totalUnit,
            address: value.address,
            city: value.city,
            state: value.state,
            zipCode: value.zipCode,
            locality: value.locality,    //landmark
            latitude: value.latitude,
            longitude: value.longitude,
            location: {
                type: "Point",
                coordinates: [value.longitude, value.latitude]
            },
            floorPlans: floorplan,
            brochure: brochure,
            gallery: gallery,
            virtualTour: virtualtour,
            threeSixtyView: threesixty,
            allUploadedFiles: allFiles,
            startDate: value.startDate,
            possessionDate: value.possessionDate,
            description: value.description,
            amenities: value.amenities,
            isVastuDone: value.isVastuDone,
            rank: "",
            createdAt: new Date(),
            isActive: false,
            isDeleted: false,
            likedBy: [],
            createdBy: id,
            currentNearLocation: value.currentNearLocation,
            isProjectApproved: false,

            searchPriority,
            homepageFeatured,
            verifiedBadge,
            purchaseId: purchaseDetails?._id || null
        };

        // Get admin users
        let adminUsers = await userServices.getAdminUsers();

        // Create default admin if none exists
        if (!adminUsers.length) {
            const admin = await userServices.createDefaultAdmin();
            adminUsers = [admin];
        };

        //add notification
        const notifications = adminUsers.map((admin) => ({
            title: "New Project Approval",
            description: `New Project request for approval`,
            model: "project",
            notificationFor: admin._id,
            isSeen: false,
            recordId: folderName
        }));

        //insert data into database and send response to client
        const result = await projectServices.addProject(dataToInsert);
        if (result?._id) {
            // Send notification to all admins
            await notificationService.bulkNotificationInsertAndEmit(request.io, notifications);

            // push Project id on user schema
            await User.findByIdAndUpdate(
                id,
                {
                    $addToSet: {   // prevents duplicate property IDs
                        projects: result._id
                    }
                },
                { new: true }
            );
            //update purchase details 
            await subscriptionPlanService.updatePurchasedSubscription(purchaseDetails._id, {projectLimit : Number(purchaseDetails.projectLimit - 1)})

            return response.ok("Project added successfully")
        } else {
            await deleteUploadedFileFolder(folderName); // upload directory path
            return response.badRequest('Failed to add project')
        }
    } catch (error) {
        console.log(error.message)
        // store log in error.log file
        logError(error, {
            api: 'addProject',
            req: request,
        });
        return response.error(error);
    }
};

module.exports = addProject;