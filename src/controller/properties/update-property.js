const runMiddleware = require("../../middlewares/multer-middleware");
const User = require("../../model/user.model");
const notificationService = require("../../services/notification.service");
const userServices = require("../../services/user.service");
const getUploadedFilesUrl = require("../../utils/helper/get-uploaded-files-url");
const logError = require("../../utils/helper/pino-log-error");
const uploadImageVideoPdfImages = require("../../utils/multer/upload-image-pdf-video");
const { addPropertyValidationSchema, updatePropertyValidationSchema } = require("../../validation/property-validation");
const projectServices = require("../../services/project.service");
const propertyServices = require("../../services/property.service");
const validateFileSize = require("../../utils/multer/check-file-size");
const deleteUploadedFileFolder = require("../../utils/helper/delete-file-folder");


const updatePropertyDetails = async (request, response) => {
    try {
        const { propertyId } = request.query;
        const folderName = propertyId
        request.folderName = folderName;

        //Extract data from the request 
        const {id} = request;
        // check file attached or not
        const isFileAttached = request?.query?.isFileAttached;
        let propertyData;

        // Handle file upload if needed
        if (isFileAttached === "true") {
            const fileResponse = await runMiddleware(request, response, uploadImageVideoPdfImages.any());
            if (fileResponse) {
                return response.status(400).json({
                    status: "FAILED",
                    message: fileResponse.code,
                });
            }
            if (!request.body.propertyData) {
                return response.badRequest("propertyData field is required when isFileAttached is true.");
            }

            try {
                propertyData = JSON.parse(request.body.propertyData);
            } catch (err) {
                return response.badRequest(
                    "Invalid JSON format in propertyData."
                );
            }        
        } else {
            propertyData = request.body;
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
            // property details section
            propertyType,
            projectId,
            propertyCategory,

            //Residential category
            residentialPropertyType,
            bhkType,
            propertyCondition,
            loanAvailability,
            flooringType,
            gatedCommunity,
            additionalRooms,

            //Commercial category
            commercialPropertyType,
            idealFor,
            washrooms,
            powerBackup,
            loadUnloadArea,
            ceilingHeight,
            cabinWorkStation,
            fireNoc,
            electricityLoad,
            commercialParking,

            //Land/Plot category
            plotArea,
            fencing,
            unit,
            landPlotPropertyType,
            legalClear,
            boundaryWall,
            roadWidth,

            propertyTitle,
            description,
            listingType,    // buy, rent , lease
            vastuCompliance,
            state,
            city,
            locality,
            landmark,
            zipCode,
            latitude,
            longitude,
            address,

            // price section details
            price,
            pricePerSqft,
            priceNegotiable,
            securityDeposit,
            maintenanceCharges,
            ownershipType,
            priceIn,

            //property overview details
            buildUpArea,
            transactionType,
            carpetArea,
            propertyArea,
            ageOfProperty,
            totalTower,
            propertyFloorNo,
            facingDirection,
            furnishing,
            bedrooms,
            bathrooms,
            balcony,
            carParking,
            waterSupply,
            googleMapLink,

            //owner details
            owner,
            mobile,
            email,
            amenities
        } = propertyData;

        // Only validate if there are fields to validate
        const {value, error} = await updatePropertyValidationSchema.validate({
            propertyId : propertyId,
            // property details section
            propertyType,
            projectId,
            propertyCategory,

            //Residential category
            residentialPropertyType,
            bhkType,
            propertyCondition,
            loanAvailability,
            flooringType,
            gatedCommunity,
            additionalRooms,

            //Commercial category
            commercialPropertyType,
            idealFor,
            washrooms,
            powerBackup,
            loadUnloadArea,
            ceilingHeight,
            cabinWorkStation,
            fireNoc,
            electricityLoad,
            commercialParking,

            //Land/Plot category
            plotArea,
            fencing,
            unit,
            landPlotPropertyType,
            legalClear,
            boundaryWall,
            roadWidth,

            propertyTitle,
            description,
            listingType,    // buy, rent , lease
            vastuCompliance,
            state,
            city,
            locality,
            landmark,
            zipCode,
            latitude,
            longitude,
            address,

            // price section details
            price,
            pricePerSqft,
            priceNegotiable,
            securityDeposit,
            maintenanceCharges,
            ownershipType,
            priceIn,

            //property overview details
            buildUpArea,
            transactionType,
            carpetArea,
            propertyArea,
            ageOfProperty,
            totalTower,
            propertyFloorNo,
            facingDirection,
            furnishing,
            bedrooms,
            bathrooms,
            balcony,
            carParking,
            waterSupply,
            googleMapLink,

            //owner details
            owner,
            mobile,
            email,
            amenities
        },
            { abortEarly: true });
        if (error) {
            if (isFileAttached === "true") { await deleteUploadedFileFolder(folderName) }
            const formattedMessage = error?.details
                .map(err => `(${err.path.join('.')}) ${err.message}`)
                .join(' | ');
            return response.validationError(formattedMessage)
        };

        //check project exist or not
        const isProjectExist = await projectServices.getProjectByObjId(value.projectId);
        if (!isProjectExist && projectId) {
            if (isFileAttached === "true") { await deleteUploadedFileFolder(folderName) }
            return response.notFound("Project not found")
        };

        //check developer exist or not
        const isUserExist = await userServices.getUserByObjectId(id);
        if (!isUserExist) {
            if (isFileAttached === "true") { await deleteUploadedFileFolder(folderName) }
            return response.notFound('User record not exist')
        };

        // Check if property exists
        const isPropertyExist = await propertyServices.getPropertyByObjId(value.propertyId);
        if (!isPropertyExist) {
            if (isFileAttached === "true") { await deleteUploadedFileFolder(folderName) }
            return response.notFound('Property record not exist')
        };

        //check property name is not similar to the existing one
        const isNameExist = await propertyServices.checkPropertyName(value.propertyId, value.propertyTitle);
        if(isNameExist){
            if (isFileAttached === "true") { await deleteUploadedFileFolder(folderName) }
            return response.badRequest("Property title already exist, Please change the name.")
        };

        //check existing pending update
        const pendingUpdate = await propertyServices.getPendingPropertyByObjId(value.propertyId);

        // Decide which data should be used as source
        const sourceProperty = pendingUpdate
            ? pendingUpdate.propertyData
            : isPropertyExist;

        const existingFiles = sourceProperty.allUploadedFiles || [];

        let allFiles = existingFiles;
        let gallery = sourceProperty.gallery || [];
        let virtualTour = sourceProperty.virtualTour || [];
        let threeSixtyView = sourceProperty.threeSixtyView || [];
        let brochure = sourceProperty.brochure || null;
        let floorPlans = sourceProperty.floorPlans || null;

        if (isFileAttached === "true") {
            const filesArray = await getUploadedFilesUrl(files, []);

            const latestUploadedFiles = [
                ...(filesArray?.gallery || []),
                ...(filesArray?.virtualtour || []),
                ...(filesArray?.threesixty || []),
                ...(filesArray?.brochure || []),
                ...(filesArray?.floorplan || [])
            ];

            allFiles = [
                ...(propertyData.allUploadedFiles || existingFiles || []),
                ...latestUploadedFiles
            ];

            // everything from allFiles
            gallery = allFiles.filter(file => file.fieldName === "gallery");

            virtualTour = allFiles.filter(file => file.fieldName === "virtualtour");

            threeSixtyView = allFiles.filter(file => file.fieldName === "threesixty");

            brochure = allFiles.find(file => file.fieldName === "brochure")?.fileUrl || null;

            floorPlans = allFiles.find(file => file.fieldName === "floorplan")?.fileUrl || null;

        } else {
            allFiles = propertyData.allUploadedFiles || existingFiles;

            // Get all gallery images
            gallery = allFiles.filter(file => file.fieldName === "gallery");

            // Get all virtual tour videos
            virtualTour = allFiles.filter(file => file.fieldName === "virtualtour");

            // Get all 360 videos
            threeSixtyView = allFiles.filter(file => file.fieldName === "threesixty");

            // Get brochure pdf
            brochure = allFiles.find(file => file.fieldName === "brochure")?.fileUrl || null;

            // Get floor plan pdf
            floorPlans = allFiles.find(file => file.fieldName === "floorplan")?.fileUrl || null;
        }

        // update data 
        const updateData = {
            propertyType: value.propertyType,
            projectId: projectId || null,
            propertyCategory: value.propertyCategory,

            // Residential
            residentialPropertyType: value.residentialPropertyType,
            bhkType: value.bhkType,
            propertyCondition: value.propertyCondition,
            loanAvailability: value.loanAvailability,
            flooringType: value.flooringType,
            gatedCommunity: value.gatedCommunity,
            additionalRooms: value.additionalRooms,

            // Commercial
            commercialPropertyType: value.commercialPropertyType,
            idealFor: value.idealFor,
            washrooms: value.washrooms,
            powerBackup: value.powerBackup,
            loadUnloadArea : value.loadUnloadArea,
            ceilingHeight: value.ceilingHeight,
            cabinWorkStation: value.cabinWorkStation,
            fireNoc: value.fireNoc,
            electricityLoad: value.electricityLoad,
            commercialParking: value.commercialParking,

            // Land/Plot
            plotArea: value.plotArea,
            fencing: value.fencing,
            unit: value.unit,
            landPlotPropertyType: value.landPlotPropertyType,
            legalClear: value.legalClear,
            boundaryWall: value.boundaryWall,
            roadWidth: value.roadWidth,

            propertyTitle: value.propertyTitle,
            description: value.description,
            listingType: value.listingType,
            vastuCompliance: value.vastuCompliance,
            state: value.state,
            city: value.city,
            locality: value.locality,
            landmark: value.landmark,
            zipCode: value.zipCode,
            latitude : value.latitude,
            longitude : value.longitude,
            location: {
                type: "Point",
                coordinates: [value.longitude, value.latitude]
            },
            address: value.address,

            // Price
            price: value.price,
            pricePerSqft: value.pricePerSqft,
            priceNegotiable: value.priceNegotiable,
            securityDeposit: value.securityDeposit,
            maintenanceCharges: value.maintenanceCharges,
            ownershipType: value.ownershipType,
            priceIn: value.priceIn,

            // Overview
            buildUpArea: value.buildUpArea,
            transactionType: value.transactionType,
            carpetArea: value.carpetArea,
            propertyArea: value.propertyArea,
            ageOfProperty: value.ageOfProperty,
            totalTower: value.totalTower,
            propertyFloorNo: value.propertyFloorNo,
            facingDirection: value.facingDirection,
            furnishing: value.furnishing,
            bedrooms: value.bedrooms,
            bathrooms: value.bathrooms,
            balcony: value.balcony,
            carParking: value.carParking,
            waterSupply: value.waterSupply,
            googleMapLink: value.googleMapLink,

            // Owner
            owner: value.owner,
            mobile: value.mobile,
            email: value.email,
            createdBy: id,
            floorPlans: floorPlans,
            brochure: brochure,
            gallery: gallery,
            virtualTour: virtualTour,
            threeSixtyView: threeSixtyView,
            allUploadedFiles: allFiles,
            status: isPropertyExist.status == "new" ?  "new" : "pending",
            amenities : value.amenities,
        };

        let result;
        if (pendingUpdate) {
            result = await propertyServices.updatePendingPropertyUpdate(
                pendingUpdate._id,
                updateData
            );
        } else if (isPropertyExist && isPropertyExist.status == "new"){
            result = await propertyServices.updatePropertyDetails(
                propertyId,
                updateData,
            )
        } else {
            result = await propertyServices.createPendingPropertyUpdate({
                propertyId : value.propertyId,
                userId: id,
                userName: isUserExist.name,
                status: "pending",
                propertyData: updateData,
                propertySnapshot: isPropertyExist
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
            title: "Property Update Approval Request",
            description: "A property update request is pending for your approval.",
            model: "property",
            notificationFor: admin._id,
            isSeen: false,
            recordId: value.propertyId
        }));

        //update property data and send response to client
        if (result) {
            //update the property status to pending
            if(isPropertyExist && isPropertyExist.status == "new"){
                await propertyServices.updatePropertyDetails(value.propertyId, {status: "new"})
            } else {
                await propertyServices.updatePropertyDetails(value.propertyId, {status: "pending"})
            }
            // Send notification to all admins
            if (!pendingUpdate) {
                await notificationService.bulkNotificationInsertAndEmit(request.io, notifications);
            }

            return response.success("property updated details submitted for approval successfully.");
        } else {
            if (isFileAttached === "true") { await deleteUploadedFileFolder(folderName) }
            return response.badRequest('Failed to update property details')
        }
    } catch (error) {
        console.log(error.message)
        // store log in error.log file
        logError(error, {
            api: 'updatePropertyDetails',
            req: request,
        });
        return response.error(error);
    }
};

module.exports = updatePropertyDetails