const dashboardService = require('../../services/dashboard.service');

const getDashboardTablesData = async (req, res) => {
    try {
        const { id, userType } = req;
        const { tableType } = req.body;
        const tablesData = await dashboardService.getDashboardTablesData({ id, userType, tableType });
        return res.status(200).json({
            success: true,
            data: tablesData
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching dashboard tables data",
            error: error.message
        });
    }
};

module.exports = getDashboardTablesData;
