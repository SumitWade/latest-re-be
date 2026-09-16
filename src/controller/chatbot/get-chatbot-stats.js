const Property = require('../../model/property.model');
const Project = require('../../model/project.model');
const AreaPriceTrend = require('../../model/area-price-trend-model');
const logError = require('../../utils/helper/pino-log-error');

const getChatbotStats = async (req, res) => {
    try {
        const totalProperties = await Property.countDocuments({ status: 'approved' });
        const activeProperties = await Property.countDocuments({ status: 'approved', isActive: true });

        const totalProjects = await Project.countDocuments({ status: 'approved' });
        const activeProjects = await Project.countDocuments({ status: 'approved', isActive: true });

        const priceTrends = await AreaPriceTrend.countDocuments();
        const priceTrendsArea = await AreaPriceTrend.find()
        const popularArea = await Property.aggregate([
            {
                $group: {
                    _id: "$locality",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ])

        const stats = {
            totalProperties,
            activeProperties,
            totalProjects,
            activeProjects,
            priceTrends,
            priceTrendsArea,
            popularArea
        };

        return res.ok(stats, "Chatbot stats fetched successfully");
    } catch (error) {
        logError(error, {
            api: 'getChatbotStats',
            req: req,
        });
        return res.error(error);
    }
};

module.exports = getChatbotStats;
