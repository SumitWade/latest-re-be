const ProjectUpdateRequest = require("../model/pending-project-approval.model");
const ProjectEnquiry = require("../model/project-enquiry-model");
const Project = require("../model/project.model");
const countPages = require("../utils/helper/count-pages");
const limit = process.env.LIMIT || 20


const projectServices = {
    checkProjectNameUnderDeveloper: (id, projName) => {
        return Project.findOne({ developerId: id, name: projName })
    },
    addProject: (dataToInsert) => {
        return Project.create(dataToInsert);
    },
    getProjectByObjId: (id) => {
        return Project.findOne({ _id: id })
    },
    checkProjectName: (id, projName) => {
        return Project.findOne({ _id: { $ne: id }, name: projName })
    },
    updateProjectDetails: async (projectId, dataToUpdate) => {
        try {
            return await Project.updateOne(
                { _id: projectId },
                { $set: dataToUpdate }
            );
        } catch (error) {
            throw error;
        }
    },
    projectPaginatedList: async (page = 1, searchString, projType, id, userType) => {
        let filter = {};
        //when type is provided
        if (projType) {
            filter.projectType = projType;
        }

        // get 
        if (id && userType !== "admin") {
            filter.createdBy = id
        }
        // search
        if (searchString) {
            const regex = new RegExp(searchString, "i");
            filter.$or = [
                { name: regex },
                { email: regex },
                { mobile: regex },
                { status: regex }
            ];
        }
        //set pagination to default one
        if (page < 1) page = 1;

        //response 
        const totalRecords = await Project.countDocuments(filter);
        const result = await Project.find(filter, { name: 1, status: 1, isActive: 1, gallery: 1 }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
        return {
            result,
            totalPages: await countPages(totalRecords),
            totalRecords
        };
    },

    getPendingProjectUpdate: (projectId) => {
        return ProjectUpdateRequest.findOne({ projectId });
    },
    createPendingProjectUpdate: (data) => {
        return ProjectUpdateRequest.create(data);
    },
    updatePendingProjectUpdate: async (pendingId, projectData) => {
        try {
            return await ProjectUpdateRequest.findByIdAndUpdate(
                pendingId,
                {
                    $set: {
                        status: "pending",
                        projectData,
                        updatedAt: new Date()
                    }
                },
                {
                    new: true
                }
            );
        } catch (error) {
            throw error;
        }
    },
    deletePendingProjectUpdate: (id) => {
        return ProjectUpdateRequest.findByIdAndDelete(id);
    },
    updatePendingStatus: async (id, data) => {
        try {
            return await ProjectUpdateRequest.findByIdAndUpdate(
                id,
                { $set: data },
                {
                    new: true,
                    runValidators: true
                }
            );
        } catch (error) {
            throw error;
        }
    },
    getAllProjectList: async (id) => {
        const filter = {}
        if (id) { filter.createdBy = id }
        return Project.find(filter, { name: 1, isActive: 1 })
    },

    getAllPublicProjectList: async (page = 1, filters = {}) => {
        try {
            const limit = 9
            if (page < 1) page = 1;

            const query = {
                isActive: true,
                // showToPublic: true,
                // approvedByAdmin: true,
                // isDeleted: false
            };

            const regexFilter = (value) => ({
                $regex: `^${value}$`,
                $options: "i"
            });

            // Search
            if (filters.searchString) {
                query.$or = [
                    { name: { $regex: filters.searchString, $options: "i" } },
                    { city: { $regex: filters.searchString, $options: "i" } },
                    { projectType: { $regex: filters.searchString, $options: "i" } },
                    { constructionStatus: { $regex: filters.searchString, $options: "i" } }
                ];
            }

            // Project Name
            if (filters.name && filters.name !== "All") {
                query.name = regexFilter(filters.name);
            }

            // Project Type
            if (filters.projectType && filters.projectType !== "All") {
                query.projectType = regexFilter(filters.projectType);
            }

            // City
            if (filters.city && filters.city !== "All") {
                query.city = regexFilter(filters.city);
            }

            // Construction Status
            if (
                filters.constructionStatus &&
                filters.constructionStatus !== "All"
            ) {
                query.constructionStatus = regexFilter(
                    filters.constructionStatus
                );
            }


            // Total Towers
            if (filters.totalTower) {
                query.totalTower = {
                    $gte: Number(filters.totalTower)
                };
            }

            // Amenities
            if (
                filters.amenities &&
                filters.amenities.length > 0
            ) {
                query.amenities = {
                    $all: filters.amenities
                };
            }

            // Price Range

            if (filters.minPrice || filters.maxPrice) {

                query.priceRange = {};

                if (filters.minPrice) {
                    query.priceRange.$gte = Number(filters.minPrice);
                }

                if (filters.maxPrice) {
                    query.priceRange.$lte = Number(filters.maxPrice);
                }

            }

            // console.log("Query:", JSON.stringify(query, null, 2));
            //-------------------------------------

            const totalRecords = await Project.countDocuments(query);

            const result = await Project.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            return {
                totalPages: await countPages(totalRecords, limit),
                totalRecords,
                result
            };

        } catch (err) {
            throw err;
        }
    },


    getPublicProjectById: async (id) => {
        try {
            const result = await Project.findOne({ _id: id, isActive: true })
                .populate("developerId", "name email mobile phone")
                .populate("createdBy", "name email mobile phone");
            return result;
        } catch (error) {
            throw error
        }
    },
    addProjectEnquiryDetails: (dataToInsert) => {
        try {
            return ProjectEnquiry.create(dataToInsert);
        } catch (error) {
            throw error
        }
    },
    getProjectById: (id) => {
        try {
            return Project.findById({ _id: id, isActive: true });
        } catch (error) {
            logError(error, {
                api: "getProjectById",
                req: id
            });
            throw error
        }
    },
    getDeveloperEnquiryList: async (searchString, page, developerId) => {
        try {
            const filter = {}
            if (searchString) {
                filter.name = { $regex: searchString, $options: "i" };
            }

            // Get all properties created by this developer
            const developerProjects = await Project.find({ createdBy: developerId }).select('_id');
            const projectIds = developerProjects.map(p => p._id);

            // Filter enquiries by the developer's property IDs
            filter.projectId = { $in: projectIds };

            //set pagination to default one
            if (page < 1) page = 1;

            const skip = (page - 1) * limit;
            const totalRecords = await ProjectEnquiry.countDocuments(filter);
            const result = await ProjectEnquiry.find(filter)
                .populate('userId', '_id')
                .populate('projectId', 'name createdBy')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            if (!result) {
                return false;
            }
            return {
                result,
                totalPages: await countPages(totalRecords),
                totalRecords: totalRecords
            };
        } catch (error) {
            throw error
        }
    },
    getProjectEnquiryList: async (searchString, page) => {
        try {
            const filter = {}
            if (searchString) {
                filter.name = { $regex: searchString, $options: "i" };
            }

            //set pagination to default one
            if (page < 1) page = 1;

            const skip = (page - 1) * limit;
            const totalRecords = await ProjectEnquiry.countDocuments(filter);
            const result = await ProjectEnquiry.find(filter)
                .populate('userId', '_id')
                .populate('projectId', 'name createdBy')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            if (!result) {
                return false;
            }
            return {
                result,
                totalPages: await countPages(totalRecords),
                totalRecords: totalRecords
            };
        } catch (error) {
            throw error
        }
    },
    changeEnquiryStatus: async (id, data) => {
        try {
            return await ProjectEnquiry.findByIdAndUpdate(id, { $set: { status: data.status } }, { new: true })
        } catch (error) {
            throw error
        }
    },
    updateProjectStatusByUserId: async (userId, isActive) => {
        try {
            return await Project.updateMany(
                { createdBy: userId },
                {
                    $set: { isActive: isActive }
                }
            );
        } catch (error) {
            throw error;
        }
    },
    getProjectLocationDetails: async (projectId) => {
        return await Project.find({ _id: projectId }, { name: 1, city: 1, locality: 1, address: 1, zipCode: 1, latitude: 1, longitude: 1, currentNearLocation: 1, state: 1 })
    }
};

module.exports = projectServices