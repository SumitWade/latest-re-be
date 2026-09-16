const runMiddleware = require("../../middlewares/multer-middleware");
const User = require("../../model/user.model");
const notificationService = require("../../services/notification.service");
const userServices = require("../../services/user.service");
const getUploadedFilesUrl = require("../../utils/helper/get-uploaded-files-url");
const logError = require("../../utils/helper/pino-log-error");
const uploadImageVideoPdfImages = require("../../utils/multer/upload-image-pdf-video");
const mongoose = require("mongoose");
const { addPropertyValidationSchema } = require("../../validation/property-validation");
const projectServices = require("../../services/project.service");
const propertyServices = require("../../services/property.service");
const validateFileSize = require("../../utils/multer/check-file-size");
const deleteUploadedFileFolder = require("../../utils/helper/delete-file-folder");
const subscriptionPlanService = require("../../services/subscription-plan.service");
const propertyId = new mongoose.Types.ObjectId();

//------------------add--properties--controller--------------------
const addProperties = async (request, response) => {
    try {
        // Generate new Project Id for every request
        const propertyId = new mongoose.Types.ObjectId();
        const folderName = propertyId.toString();  //property id in string for folder
        request.propertyId = propertyId;
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

        //extract data from the request body
        let propertyData;
        try {
            if (request.body.propertyData && request.body.propertyData !== 'undefined') {
                propertyData = typeof request.body.propertyData === 'string' ? JSON.parse(request.body.propertyData) : request.body.propertyData;
            } else {
                propertyData = request.body;
            }
        } catch (error) {
            propertyData = request.body;
        }
        const { id, purchaseId } = request

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

        //check validation
        const {value, error} = await addPropertyValidationSchema.validate({
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
        }, { abortEarly: true });
        if (error) {
            await deleteUploadedFileFolder(folderName); // upload directory path
            const formattedMessage = error?.details
                .map(err => `(${err.path.join('.')}) ${err.message}`)
                .join(' | ');
            return response.validationError(formattedMessage)
        };

        // Get the purchase details
        const purchaseDetails = await subscriptionPlanService.getPurchasedSubscriptionDetails(id);

        //check if the property listing limit reach
        if(purchaseDetails && purchaseDetails.maxListings == 0){
            await deleteUploadedFileFolder(folderName); // upload directory path
            return response.badRequest("Your property listing limit exhausts")
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

        //project exist or not
        const isProjectExist = await projectServices.getProjectByObjId(value.projectId);
        if(!isProjectExist && projectId){
            await deleteUploadedFileFolder(folderName); // upload directory path
            return response.notFound("Project record not exist")
        }

        //check property title already exist or not
        const isTitleExist = await propertyServices.checkPropertyNameWhileAdd(value.propertyTitle)
        if(isTitleExist){
            await deleteUploadedFileFolder(folderName); // upload directory path
            return response.badRequest("Property title already exist.")
        }

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

        // Prepare property data for insertion
        const propertyDataToInsert = {
            _id: propertyId,
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
            floorPlans: floorplan,
            brochure: brochure,
            gallery: gallery,
            virtualTour: virtualtour,
            threeSixtyView: threesixty,
            allUploadedFiles: allFiles,
            amenities: value.amenities,
            isActive: false,

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
            title: "New Property Approval",
            description: `New property approval request`,
            model: "property",
            notificationFor: admin._id,
            isSeen: false,
            recordId: folderName
        }));

        //insert data into database and send response to client
        const result = await propertyServices.addProperty(propertyDataToInsert);
        if (result?._id) {
            // Send notification to all admins
            await notificationService.bulkNotificationInsertAndEmit(request.io, notifications );

            // push Project id on user schema
            await User.findByIdAndUpdate(
                id,
                {
                    $addToSet: {   // prevents duplicate property IDs
                        properties: result._id
                    }
                },
                { new: true }
            );

            //update purchase details 
            await subscriptionPlanService.updatePurchasedSubscription(purchaseDetails._id, {maxListings : Number(purchaseDetails.maxListings - 1)})
            return response.ok("Property added successfully and forwarded for approval.")
        } else {
            await deleteUploadedFileFolder(folderName); // upload directory path
            return response.badRequest('Failed to add property')
        }
    } catch (error) {
        console.log(error)
        // store log in error.log file
        logError(error, {
            api: 'addProperties',
            req: request,
        });
        return response.error(error);
    }
};

module.exports = addProperties;