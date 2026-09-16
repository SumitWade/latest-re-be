const runMiddleware = require("../../middlewares/multer-middleware");
const notificationService = require("../../services/notification.service");
const projectServices = require("../../services/project.service");
const userServices = require("../../services/user.service");
const deleteUploadedFileFolder = require("../../utils/helper/delete-file-folder");
const deleteMultipleFiles = require("../../utils/helper/delete-multiple-file");
const deletePreviousMultipleFiles = require("../../utils/helper/delete-previous-multiple-files");
const getUploadedFilesUrl = require("../../utils/helper/get-uploaded-files-url");
const logError = require("../../utils/helper/pino-log-error");
const validateFileSize = require("../../utils/multer/check-file-size");
const uploadImageVideoPdfImages = require("../../utils/multer/upload-image-pdf-video");
const { updateProjectValidationSchema } = require("../../validation/project-validation");

const updateProjectDetails = async (request, response) => {
    try {
        const { projId } = request.query;
        const folderName = projId
        request.folderName = projId;

        //Extract data from the request 
        const { id } = request;
        // check file attached or not
        const isFileAttached = request?.query?.isFileAttached;
        let projectData;

        // Handle file upload if needed
        if (isFileAttached === "true") {
            const fileResponse = await runMiddleware(request, response, uploadImageVideoPdfImages.any());
            if (fileResponse) {
                return response.status(400).json({
                    status: "FAILED",
                    message: fileResponse.code,
                });
            }
            projectData = JSON.parse(request.body.projectData);
            console.log("projectData", projectData)
        } else {
            projectData = request.body;
        }

        //check file limit should not be greater than the 2MB or 10MB
        const files = request?.files || [];

        if (isFileAttached === "true") {
            //check file limit should not be greater than the 2MB or 10MB
            const validation = validateFileSize(files);
            if (!validation.isValid) {
                if (isFileAttached === "true") { await deleteUploadedFileFolder(folderName) }
                return response.badRequest(validation.message);
            }
        }
        //extract data from request body
        const {
            // projectId,
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
            currentNearLocation
        } = projectData;

        //check validation
        const { value, error } = await updateProjectValidationSchema.validate({
            projectId: projId,
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
            currentNearLocation
        }, { abortEarly: true });

        if (error) {
            if (isFileAttached === "true") { await deleteUploadedFileFolder(folderName) }
            const formattedMessage = error?.details
                .map(err => `(${err.path.join('.')}) ${err.message}`)
                .join(' | ');
            return response.validationError(formattedMessage)
        };

        //check project exist or not
        const isProjectExist = await projectServices.getProjectByObjId(value.projectId);
        if (!isProjectExist) {
            if (isFileAttached === "true") { await deleteUploadedFileFolder(folderName) }
            return response.notFound("Project not found")
        };

        //check developer exist or not
        const isDeveloperExist = await userServices.getUserByObjectId(id);
        if (!isDeveloperExist) {
            if (isFileAttached === "true") { await deleteUploadedFileFolder(folderName) }
            return response.notFound('User record not exist')
        };

        //check existing pending update
        const pendingUpdate = await projectServices.getPendingProjectUpdate(value.projectId);

        // Decide which data should be used as source
        const sourceProject = pendingUpdate
            ? pendingUpdate.projectData
            : isProjectExist;

        //check project name is not similar to the existing one
        const isNameExist = await projectServices.checkProjectName(value.projectId, value.name);
        if (isNameExist) {
            if (isFileAttached === "true") { await deleteUploadedFileFolder(folderName) }
            return response.badRequest("Project name already exist, Please change the name.")
        }

        const existingFiles = sourceProject.allUploadedFiles || [];

        let allFiles = existingFiles;
        let gallery = sourceProject.gallery || [];
        let virtualTourUrl = sourceProject.virtualTourUrl || [];
        let threeSixtyView = sourceProject.threeSixtyView || [];
        let brochure = sourceProject.brochure || null;
        let floorPlans = sourceProject.floorPlans || null;

        //when files are attached
        if (isFileAttached === "true") {
            const filesArray = await getUploadedFilesUrl(files, []);

            const latestUploadedFiles = [
                ...(filesArray?.gallery || []),
                ...(filesArray?.virtualtour || []),
                ...(filesArray?.threesixty || []),
                ...(filesArray?.brochure || []),
                ...(filesArray?.floorplan || [])
            ];

            // Combine existing + newly uploaded files
            allFiles = [
                ...(projectData.allUploadedFiles || existingFiles || []),
                ...latestUploadedFiles
            ];
            console.log("projectData", projectData.allUploadedFiles)

            // Now derive everything from allFiles
            gallery = allFiles.filter(file => file.fieldName === "gallery");

            virtualTourUrl = allFiles.filter(file => file.fieldName === "virtualtour");

            threeSixtyView = allFiles.filter(file => file.fieldName === "threesixty");

            brochure = allFiles.find(file => file.fieldName === "brochure")?.fileUrl || null;

            floorPlans = allFiles.find(file => file.fieldName === "floorplan")?.fileUrl || null;
        } else {
            allFiles = projectData.allUploadedFiles || existingFiles;

            console.log("projectData.allUploadedFiles", projectData.allUploadedFiles)
            // Get all gallery images
            gallery = allFiles.filter(file => file.fieldName === "gallery");

            // Get all virtual tour videos
            virtualTourUrl = allFiles.filter(file => file.fieldName === "virtualtour");

            // Get all 360 videos
            threeSixtyView = allFiles.filter(file => file.fieldName === "threesixty");

            // Get brochure pdf
            brochure = allFiles.find(file => file.fieldName === "brochure")?.fileUrl || null;

            // Get floor plan pdf
            floorPlans = allFiles.find(file => file.fieldName === "floorplan")?.fileUrl || null;
        }

        if (!floorPlans) {
            if (isFileAttached === "true") { await deleteUploadedFileFolder(folderName) }
            return response.badRequest("Floor plan file is required.");
        }

        //data to update
        const dataToUpdate = {
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
            floorPlans: floorPlans,
            brochure: brochure,
            gallery: gallery,
            virtualTour: virtualTourUrl,
            threeSixtyView: threeSixtyView,
            allUploadedFiles: allFiles,
            startDate: value.startDate,
            possessionDate: value.possessionDate,
            description: value.description,
            amenities: value.amenities,
            isVastuDone: value.isVastuDone,
            status: "pending",
            currentNearLocation: value.currentNearLocation
        };
        console.log('currentNearLocation', dataToUpdate)
        let result;
        if (pendingUpdate) {
            result = await projectServices.updatePendingProjectUpdate(
                pendingUpdate._id,
                dataToUpdate
            );
        } else if (isProjectExist && isProjectExist.status == "new") {
            result = await projectServices.updateProjectDetails(
                projectId = value.projectId,
                dataToUpdate
            );
        } else {
            result = await projectServices.createPendingProjectUpdate({
                projectId: value.projectId,
                developerId: id,
                developerName: isDeveloperExist.name,
                status: "pending",
                projectData: dataToUpdate,
                projectSnapshot: isProjectExist
            });
        }

        // Get admin users
        let adminUsers = await userServices.getAdminUsers();

        // Create default admin if none exists
        if (!adminUsers.length) {
            const admin = await userServices.createDefaultAdmin();
            adminUsers = [admin];
        };

        //add notification
        const notifications = adminUsers.map((admin) => ({
            title: "Project Update Approval Request",
            description: "A project update request is pending for your approval.",
            model: "project",
            notificationFor: admin._id,
            isSeen: false,
            recordId: value.projectId
        }));

        //update project data and send response to client
        if (result) {
            //update the project status to pending
            if (isProjectExist && isProjectExist.status == "new") {
                await projectServices.updateProjectDetails(value.projectId, { status: "new" })
            } else {
                await projectServices.updateProjectDetails(value.projectId, { status: "pending" })
            }

            // Send notification to all admins
            if (!pendingUpdate) {
                await notificationService.bulkNotificationInsertAndEmit(request.io, notifications);
            }

            return response.success("Project updated details submitted for approval successfully.");
        } else {
            if (isFileAttached === "true") { await deleteUploadedFileFolder(folderName) }
            return response.badRequest('Failed to update project details')
        }
    } catch (error) {
        console.log(error.message)
        // store log in error.log file
        logError(error, {
            api: 'updateProjectDetails',
            req: request,
        });
        return response.error(error);
    }
};

module.exports = updateProjectDetails