const dashboardService = require('../../services/dashboard.service');

const getTablesCount = async (req, res) => {
    try {
        const { id, userType } = req;
        const countData = await dashboardService.getDashboardTablesCount({ id, userType });
        return res.status(200).json({
            success: true,
            data: countData
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching dashboard tables count",
            error: error.message
        });
    }
};

module.exports = getTablesCount;
