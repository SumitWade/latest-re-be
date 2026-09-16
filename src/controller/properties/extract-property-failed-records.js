const XLSX = require("xlsx");
const PropertyBulkUploadLog = require("../../model/property-upload-log.model");

const exportBulkUploadReport = async (req, res) => {
    try {
        const { _id } = req;

        const report = await PropertyBulkUploadLog.findOne({
            createdBy: _id
        })
            .sort({ createdAt: -1 })
            .lean();

        if (!report) {
            return res.notFound("No bulk upload report found.");
        }

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([]);

        // ==========================
        // Summary Section
        // ==========================

        XLSX.utils.sheet_add_aoa(worksheet, [
            ["Bulk Upload Summary"],
            [],
            [
                "File Name",
                "Total Records",
                "Success Count",
                "Failed Count",
                "Status",
                "Uploaded On"
            ],
            [
                report.fileName,
                report.totalRecords,
                report.successCount,
                report.failedCount,
                report.status,
                new Date(report.createdAt).toLocaleString("en-IN")
            ]
        ], { origin: "A1" });

        // ==========================
        // Failed Records Section
        // ==========================

        const failedStartRow = 8;

        XLSX.utils.sheet_add_aoa(
            worksheet,
            [["Failed Records"]],
            { origin: `A${failedStartRow}` }
        );

        XLSX.utils.sheet_add_aoa(
            worksheet,
            [[
                "Sheet",
                "Row",
                "Property Title",
                "Reason"
            ]],
            { origin: `A${failedStartRow + 2}` }
        );

        const failedRows = report.failedRecords.map(item => [
            item.sheet,
            item.row,
            item.propertyTitle,
            item.reason
        ]);

        if (failedRows.length) {
            XLSX.utils.sheet_add_aoa(
                worksheet,
                failedRows,
                { origin: `A${failedStartRow + 3}` }
            );
        } else {
            XLSX.utils.sheet_add_aoa(
                worksheet,
                [["No Failed Records"]],
                { origin: `A${failedStartRow + 3}` }
            );
        }

        // ==========================
        // Column Width
        // ==========================

        worksheet["!cols"] = [
            { wch: 20 },
            { wch: 15 },
            { wch: 18 },
            { wch: 18 },
            { wch: 20 },
            { wch: 25 }
        ];

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Bulk Upload Report"
        );

        const buffer = XLSX.write(workbook, {
            type: "buffer",
            bookType: "xlsx"
        });

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=Uploaded_Records_Report.xlsx"
        );

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        return res.send(buffer);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: "FAILED",
            message: error.message
        });
    }
};

module.exports = exportBulkUploadReport