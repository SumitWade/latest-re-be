const Property = require('../model/property.model');
const User = require('../model/user.model');
const Project = require('../model/project.model');
// const Lead = require('../model/lead.model');
const PendingPropertiesApproval = require('../model/pending-property-approval.model');
const PendingProjectApproval = require("../model/pending-project-approval.model");
const PropertyEnquiry = require('../model/property-enquiry.model');
const ProjectEnquiry = require('../model/project-enquiry-model');
const AreaPriceTrend = require('../model/area-price-trend-model');
const getHotSellingPipeline = () => {
    return [
        // Wishlist Count
        {
            $lookup: {
                from: "wishlists",
                let: { propertyId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$propertyId", "$$propertyId"] },
                                    { $eq: ["$isLiked", true] }
                                ]
                            }
                        }
                    },
                    { $count: "count" }
                ],
                as: "wishlist"
            }
        },

        // Enquiry Count
        {
            $lookup: {
                from: "propertyenquiries",
                let: { propertyId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$propertyId", "$$propertyId"] }
                        }
                    },
                    { $count: "count" }
                ],
                as: "enquiry"
            }
        },
        // rating and reviews 
        {
            $lookup: {
                from: "reviews",
                let: { propertyId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$propertyId", "$$propertyId"] },
                                    { $eq: ["$reviewType", "property"] },
                                    { $eq: ["$isActive", true] }
                                ]
                            }
                        }
                    }
                ],
                as: "propertyReviews"
            }
        },

        // Counts
        {
            $addFields: {
                wishlistCount: {
                    $ifNull: [{ $arrayElemAt: ["$wishlist.count", 0] }, 0]
                },
                enquiryCount: {
                    $ifNull: [{ $arrayElemAt: ["$enquiry.count", 0] }, 0]
                },
                reviewsCount: { $size: "$propertyReviews" },
                averageRating: { $ifNull: [{ $avg: "$propertyReviews.rating" }, 0] }
            }
        },

        // Total
        {
            $addFields: {
                totalCount: {
                    $add: ["$wishlistCount", "$enquiryCount"]
                }
            }
        },

        // Return only required property fields
        {
            $project: {
                wishlistCount: 1,
                enquiryCount: 1,
                totalCount: 1,
                propertyTitle: 1,
                propertyType: 1,
                city: 1,
                locality: 1,
                price: 1,
                priceIn: 1,
                gallery: 1,
                status: 1,
                createdAt: 1,
                createdBy: 1,
                propertyCategory: 1,
                isVerified: 1,
                state: 1,
                reviewsCount: 1,
                averageRating: 1
            }
        }
    ]
}
const dashboardService = {
    async getCardsStats({ id, userType }) {
        try {
            let propertyFilter = {};
            let projectFilter = {};
            let pendingPropertyFilter = {};
            let pendingProjectFilter = {};

            if (userType !== 'admin') {
                propertyFilter = { createdBy: id };
                projectFilter = { createdBy: id };
                pendingPropertyFilter = { userId: id };
                pendingProjectFilter = { developerId: id };
            }

            const totalProperties = await Property.countDocuments(propertyFilter);
            const totalUsers = await User.countDocuments();
            const totalActiveProperty = await Property.countDocuments({ ...propertyFilter, isActive: true });
            const totalVerifiedProperties = await Property.countDocuments({ ...propertyFilter, isVerified: true });
            const totalUnverifiedProperties = await Property.countDocuments({ ...propertyFilter, isVerified: false });

            const pendingPropertyRequest = await PendingPropertiesApproval.countDocuments(pendingPropertyFilter);
            const pendingProjectRequest = await PendingProjectApproval.countDocuments(pendingProjectFilter);

            const totalProjects = await Project.countDocuments(projectFilter);
            const totalActiveProjects = await Project.countDocuments({ ...projectFilter, isActive: true });
            const totalInactiveProjects = await Project.countDocuments({ ...projectFilter, isActive: false });
            const totalUnverifiedProjects = await Project.countDocuments({ ...projectFilter, isVerified: false });
            const totalVerifiedProjects = await Project.countDocuments({ ...projectFilter, isVerified: true });
            const hotsellingResult = await Property.aggregate(getHotSellingPipeline());
            const totalHotsellingProperties = hotsellingResult.filter(item => {
                const hasCount = item.totalCount >= 1;
                const isOwner = userType === 'admin' || (item.createdBy && item.createdBy.toString() === id.toString());
                return hasCount && isOwner;
            }).length;
            let propertyEnquiryFilter = {};
            let projectEnquiryFilter = {};

            if (userType !== 'admin') {
                const developerProperties = await Property.find({ createdBy: id }).select('_id');
                const propertyIds = developerProperties.map(p => p._id);
                propertyEnquiryFilter = { propertyId: { $in: propertyIds } };

                const developerProjects = await Project.find({ createdBy: id }).select('_id');
                const projectIds = developerProjects.map(p => p._id);
                projectEnquiryFilter = { projectId: { $in: projectIds } };
            }

            const totalProjectEnquiry = await ProjectEnquiry.countDocuments(projectEnquiryFilter);
            const totalPropertyEnquiry = await PropertyEnquiry.countDocuments(propertyEnquiryFilter);
            const totalAreaCover = await AreaPriceTrend.countDocuments();
            const areasCover = await AreaPriceTrend.distinct("area");
            return {
                totalProperties,
                totalUsers,
                totalActiveProperty,
                totalVerifiedProperties,
                totalUnverifiedProperties,
                pendingPropertyRequest,
                pendingProjectRequest,
                totalProjects,
                totalActiveProjects,
                totalInactiveProjects,
                totalUnverifiedProjects,
                totalVerifiedProjects,
                totalHotsellingProperties,
                totalProjectEnquiry,
                totalPropertyEnquiry,
                totalAreaCover,
                areasCover
                // totalLeads
            };
        } catch (error) {
            throw error;
        }
    },
    getTotalEnquiriesCount: async ({ id, userType }) => {
        try {
            console.log(id, userType, "--------------")
            let propertyEnquiryFilter = {};
            let projectEnquiryFilter = {};

            if (userType !== 'admin') {
                const developerProperties = await Property.find({ createdBy: id }).select('_id');
                const propertyIds = developerProperties.map(p => p._id);
                propertyEnquiryFilter = { propertyId: { $in: propertyIds } };

                const developerProjects = await Project.find({ createdBy: id }).select('_id');
                const projectIds = developerProjects.map(p => p._id);
                projectEnquiryFilter = { projectId: { $in: projectIds } };
            }

            const totalPropertyEnquiryCount = await PropertyEnquiry.countDocuments(propertyEnquiryFilter);
            const totalProjectEnquiryCount = await ProjectEnquiry.countDocuments(projectEnquiryFilter);

            const aggregateMonthwise = async (model, filter) => {
                const data = await model.aggregate([
                    { $match: filter },
                    {
                        $group: {
                            _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { "_id.year": 1, "_id.month": 1 } }
                ]);

                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                return data.map(item => ({
                    month: months[item._id.month - 1],
                    year: item._id.year,
                    count: item.count
                }));
            };

            const propertyEnquiriesMonthwise = await aggregateMonthwise(PropertyEnquiry, propertyEnquiryFilter);
            const projectEnquiriesMonthwise = await aggregateMonthwise(ProjectEnquiry, projectEnquiryFilter);

            const mergedMonthwise = {};

            propertyEnquiriesMonthwise.forEach(item => {
                const key = `${item.month}-${item.year}`;
                if (!mergedMonthwise[key]) {
                    mergedMonthwise[key] = { month: item.month, year: item.year, totalPropertyEnquiryCount: 0, totalProjectEnquiryCount: 0 };
                }
                mergedMonthwise[key].totalPropertyEnquiryCount = item.count;
            });

            projectEnquiriesMonthwise.forEach(item => {
                const key = `${item.month}-${item.year}`;
                if (!mergedMonthwise[key]) {
                    mergedMonthwise[key] = { month: item.month, year: item.year, totalPropertyEnquiryCount: 0, totalProjectEnquiryCount: 0 };
                }
                mergedMonthwise[key].totalProjectEnquiryCount = item.count;
            });

            const monthwiseEnquiries = Object.values(mergedMonthwise).sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                return months.indexOf(a.month) - months.indexOf(b.month);
            });

            return {
                totalPropertyEnquiryCount,
                totalProjectEnquiryCount,
                monthwiseEnquiries
            };
        } catch (error) {
            throw error;
        }
    },
    getLocalitiesWiseProjectProperty: async () => {
        try {
            const projectAgg = await Project.aggregate([
                {
                    $group: {
                        _id: "$locality",
                        city: { $first: "$city" },
                        projectCount: { $sum: 1 }
                    }
                }
            ]);

            const propertyAgg = await Property.aggregate([
                {
                    $group: {
                        _id: "$locality",
                        city: { $first: "$city" },
                        propertyCount: { $sum: 1 }
                    }
                }
            ]);

            const locationMap = new Map();

            projectAgg.forEach(p => {
                if (p._id) {
                    locationMap.set(p._id.trim().toLowerCase(), { locality: p._id, city: p.city, projectCount: p.projectCount, propertyCount: 0 });
                }
            });

            propertyAgg.forEach(p => {
                if (p._id) {
                    const key = p._id.trim().toLowerCase();
                    if (locationMap.has(key)) {
                        locationMap.get(key).propertyCount = p.propertyCount;
                    } else {
                        locationMap.set(key, { locality: p._id, city: p.city, projectCount: 0, propertyCount: p.propertyCount });
                    }
                }
            });

            return Array.from(locationMap.values());
        } catch (error) {
            throw error;
        }
    },
    getPropertyTypeCount: async () => {
        try {
            const propertyTypeAgg = await Property.aggregate([
                {
                    $group: {
                        _id: "$propertyCategory",
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        propertyCategory: "$_id",
                        count: 1
                    }
                }
            ]);
            return propertyTypeAgg;
        }
        catch (error) {
            throw error;
        }
    },
    getDashboardTablesData: async ({ id, userType, tableType }) => {
        try {
            let propertyFilter = {};
            let projectFilter = {};
            let userFilter = {};
            let propEnquiryFilter = {};
            let projEnquiryFilter = {};

            if (userType !== 'admin') {
                propertyFilter.createdBy = id;
                projectFilter.createdBy = id;
            }


            if (tableType === 'properties' || tableType === 'Property') {
                const propertiesData = await Property.find(propertyFilter)
                    .sort({ createdAt: -1 })
                    .limit(10)
                    .lean();

                const formattedProperties = propertiesData.map(p => ({
                    _id: p._id,
                    title: p.propertyTitle,
                    location: `${p.locality ? p.locality + ' / ' : ''}${p.city}`,
                    propertyType: p.propertyType,
                    price: p.priceIn ? `${p.price} ${p.priceIn}` : p.price,
                    isVerified: p.isVerified,
                    isHotSelling: p.hotSelling || false,
                    isActive: p.isActive,
                    enquiriesCount: p.reviews || 0,
                    image: p.gallery && p.gallery.length > 0 ? p.gallery[0] : "",
                }));
                return { properties: formattedProperties };
            }

            if (tableType === 'projects' || tableType === 'Project') {
                const projectsData = await Project.find(projectFilter)
                    .sort({ createdAt: -1 })
                    .limit(10)
                    .lean();
                
                const formattedProjects = projectsData.map(p => ({
                    _id: p._id,
                    title: p.name,
                    locality: `${p.locality ? p.locality + ' / ' : ''}${p.city}`,
                    builder: p.developerName || "Unknown",
                    totalUnits: p.totalUnit || 0,
                    activeUnits: p.totalUnit || 0,
                    status: p.status || "Active",
                    isVerified: p.approvedByAdmin || false,
                    image: p.gallery && p.gallery.length > 0 ? p.gallery[0] : "",
                }));
                return { projects: formattedProjects };
            }

            if (tableType === 'enquiries' || tableType === 'Enquiry') {
                const propEnquiries = await PropertyEnquiry.find(propEnquiryFilter)
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .populate('propertyId', 'propertyTitle')
                    .lean();

                const projEnquiries = await ProjectEnquiry.find(projEnquiryFilter)
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .populate('projectId', 'name')
                    .lean();

                const formattedEnquiries = [
                    ...propEnquiries.map(e => ({
                        _id: e._id,
                        name: e.name,
                        email: e.email,
                        phone: e.phone,
                        type: "Property Enquiry",
                        targetTitle: e.propertyId ? e.propertyId.propertyTitle : "Unknown",
                        date: e.createdAt,
                        status: "New"
                    })),
                    ...projEnquiries.map(e => ({
                        _id: e._id,
                        name: e.name,
                        email: e.email,
                        phone: e.phone,
                        type: "Project Enquiry",
                        targetTitle: e.projectId ? e.projectId.name : "Unknown",
                        date: e.createdAt,
                        status: "New"
                    }))
                ].sort((a, b) => new Date(b.date) - new Date(a.date));
                return { enquiries: formattedEnquiries };
            }

            if (tableType === 'users' || tableType === 'User') {
                const usersData = await User.find(userFilter)
                    .sort({ createdAt: -1 })
                    .limit(10)
                    .lean();
                
                const formattedUsers = usersData.map(u => ({
                    _id: u._id,
                    name: u.name,
                    email: u.email,
                    mobile: u.mobile,
                    role: u.userType || "User",
                    joined: new Date(u.createdAt).toLocaleDateString(),
                    isActive: u.isActive,
                    verified: u.isPlatformRatingDone || false
                }));
                return { users: formattedUsers };
            }

            return {};
        } catch (error) {
            throw error;
        }
    },
    getDashboardTablesCount: async ({ id, userType }) => {
        try {
            let propertyFilter = {};
            let projectFilter = {};

            if (userType !== 'admin') {
                propertyFilter.createdBy = id;
                projectFilter.createdBy = id;
            }

            const propertiesCount = await Property.countDocuments(propertyFilter);
            const projectsCount = await Project.countDocuments(projectFilter);
            
            const propEnquiriesCount = await PropertyEnquiry.countDocuments();
            const projEnquiriesCount = await ProjectEnquiry.countDocuments();
            const enquiriesCount = propEnquiriesCount + projEnquiriesCount;
            
            const usersCount = await User.countDocuments();

            return {
                properties: propertiesCount,
                projects: projectsCount,
                enquiries: enquiriesCount,
                users: usersCount
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = dashboardService;
