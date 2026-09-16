const XLSX = require("xlsx");
const fs = require("fs");
const excelUploads = require("../../utils/multer/upload-excel");
const Property = require("../../model/property.model");
const PropertyBulkUploadLog = require("../../model/property-upload-log.model");

//middleware to parse file
const runMiddleware = (req, res, fn) => {
    return new Promise((resolve, reject) => {
        fn(req, res, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

//check the array
const toArray = (value = "") => {
    if (!value) return [];
    return String(value).split(",").map((x) => x.trim()).filter(Boolean);
};

//check the number
const toNumber = (value) => {
    if (value === "" || value === null || value === undefined)
        return null;

    const n = Number(value);
    return isNaN(n) ? null : n;
};

const normalizeRow = (row) => {
    const obj = {};
    Object.keys(row).forEach((key) => {
        obj[key.trim().toLowerCase()] = row[key];
    });
    return obj;
};

//normalize the space
const normalizePropertyTitle = (title = "") => {
    return String(title)
        .trim()                  // remove leading/trailing spaces
        .replace(/\s+/g, " ");   // replace multiple spaces with a single space
};

const SHEETS = [
    {
        sheet: "Residential",
        category: "Residential"
    },
    {
        sheet: "Commercial",
        category: "Commercial"
    },
    {
        sheet: "Land-Plot",
        category: "Land/Plot"
    }
];

const COMMON_HEADERS = [
    "property_title",
    "listing_type",
    "state",
    "city",
    "locality",
    "pincode",
    "property_area_sq_ft",
    "build_up_area_sq_ft",
    "price",
    "pricein",
    "mobile",
    "description",
    "owner_landlord_name",
    "email",
    "price_per_sq_ft"
];

const HEADERS = {
    Residential: [
        "residential_property_type",
        "bhk_type",
        "property_condition",
        "loan_availability",
        "flooring_type",
        "gated_community"
    ],

    Commercial: [
        "commercial_property_type",
        "washrooms",
        "power_backup",
        "loading_unloading_area",
        "ceiling_height_in_ft",
        "number_of_cabin_workstation",
        "fire_noc",
        "electricity_load_kva",
        "parking"
    ],

    "Land/Plot": [
        "land_plot_property_type",
        "plot_area",
        "plot_unit",
        "gated_community",
        "fencing",
        "boundary_wall",
        "legal_clear_title",
        "road_width_ft",
    ]
};

const uploadBulkProperty = async (req, res) => {
    try {
        const { _id } = req;

        await runMiddleware(req, res, excelUploads.single("file"));
        if (!req.file) {
            return res.notFound("Excel file is required.")
        }

        const workbook = XLSX.readFile(req.file.path);
        const successRecords = [];
        const failedRecords = [];
        let bulkOps = [];
        let totalRecords = 0;
        const CHUNK_SIZE = 100;
        const uploadedTitles = new Set();

        const existingProperties = await Property.find({}, { propertyTitle: 1, _id: 0 } ).lean();
        const existingTitles = new Set(
            existingProperties.map((item) => normalizePropertyTitle(item.propertyTitle).toLowerCase() )
        );

        for (const currentSheet of SHEETS) {

            const worksheet = workbook.Sheets[currentSheet.sheet];
            if (!worksheet) continue;
            const rows = XLSX.utils.sheet_to_json( worksheet, { defval: "" });
            if (!rows.length) continue;

            const data = rows.map(normalizeRow);
            totalRecords += data.length;

            const expectedHeaders = [
                ...COMMON_HEADERS,
                ...HEADERS[currentSheet.category]
            ];            
            const actualHeaders = Object.keys(data[0]);
            const missingHeaders = expectedHeaders.filter(h => !actualHeaders.includes(h));

            if (missingHeaders.length) {
                failedRecords.push({
                    sheet: currentSheet.sheet,
                    row: 1,
                    reason: `Missing headers : ${missingHeaders.join(", ")}`
                });
                continue;
            }

            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                const excelRow = i + 2;
                const rowErrors = [];
                row.property_title = normalizePropertyTitle(row.property_title);

                // Common Validation
                if (!row.property_title)
                    rowErrors.push("Property Title is required.");

                if (!row.owner_landlord_name)
                    rowErrors.push("Owner Landlord name is required.");

                if (!["Rent", "Sale"].includes(row.listing_type))
                    rowErrors.push("Invalid Listing Type.");

                if (!row.state)
                    rowErrors.push("State is required.");

                if (!row.city)
                    rowErrors.push("City is required.");

                if (!row.locality)
                    rowErrors.push("Locality is required.");

                if (!row.pincode)
                    rowErrors.push("Pin Code is required.");

                if (!row.description)
                    rowErrors.push("Description is required.");

                if (toNumber(row.price) === null)
                    rowErrors.push("Invalid Price.");

                if (toNumber(row.price_per_sq_ft) === null)
                    rowErrors.push("Invalid Price per SqFt.");

                if (toNumber(row.property_area_sq_ft) === null)
                    rowErrors.push("Invalid Property Area.");

                if (toNumber(row.build_up_area_sq_ft) === null)
                    rowErrors.push("Invalid Build up Area.");

                if (!/^[6-9]\d{9}$/.test(String(row.mobile)))
                    rowErrors.push("Invalid Mobile Number.");

                // Category Validation
                if (currentSheet.category === "Residential") {
                    if (!row.residential_property_type) rowErrors.push("Residential Property Type is required.");
                    if (!row.bhk_type) rowErrors.push("BHK Type detail is required.");
                    if (!row.property_condition) rowErrors.push("Property Condition detail is required.");
                    if (!row.loan_availability) rowErrors.push("Loan Availability detail is required.");
                    if (!row.flooring_type) rowErrors.push("Flooring Type detail is required.");
                    if (!row.gated_community) rowErrors.push("Gated Community detail is required.");
                }

                if (currentSheet.category === "Commercial") {
                    if (!row.commercial_property_type) rowErrors.push("Commercial Property Type is required.");
                    if (!row.washrooms) rowErrors.push("Washrooms detail is required.");
                    if (!row.power_backup) rowErrors.push("Power Backup detail is required.");
                    if (!row.loading_unloading_area) rowErrors.push("Loading Unloading Area detail is required.");
                    if (toNumber(row.ceiling_height_in_ft) === null) rowErrors.push("Ceiling Height detail is required.");
                    if (toNumber(row.number_of_cabin_workstation) === null) rowErrors.push("No of Cabin Workstation detail is required.");
                    if (toNumber(row.electricity_load_kva) === null) rowErrors.push("Electricity Load (KVA) detail is required.");
                    if (!row.fire_noc) rowErrors.push("Fire NOC detail is required.");
                    if (!row.parking) rowErrors.push("Parking detail is required.");
                }

                if (currentSheet.category === "Land/Plot") {
                    if (!row.land_plot_property_type) rowErrors.push("Land Plot Property Type is required.");
                    if (toNumber(row.plot_area) === null) rowErrors.push("Plot Area detail is required.");
                    if (!row.plot_unit) rowErrors.push("Plot Unit detail is required.");
                    if (!row.gated_community) rowErrors.push("Gated Community detail is required.");
                    if (!row.fencing) rowErrors.push("Fencing detail is required.");
                    if (!row.boundary_wall) rowErrors.push("Boundary Wall detail is required.");
                    if (!row.legal_clear_title) rowErrors.push("Legal Clear detail is required.");
                    if (toNumber(row.road_width_ft) === null) rowErrors.push("Road Width detail is required.");
                }

                if (rowErrors.length) {
                    failedRecords.push({
                        sheet: currentSheet.sheet,
                        row: excelRow,
                        propertyTitle: row.property_title || "",
                        reason: rowErrors.join(", ")
                    });
                    continue;
                }

                const normalizedTitle = row.property_title.toLowerCase();

                // Duplicate within the uploaded Excel
                if (uploadedTitles.has(normalizedTitle)) {
                    failedRecords.push({
                        sheet: currentSheet.sheet,
                        row: excelRow,
                        propertyTitle: row.property_title,
                        reason: "Duplicate property title in uploaded file."
                    });
                    continue;
                }

                // Duplicate in database
                if (existingTitles.has(normalizedTitle)) {
                    failedRecords.push({
                        sheet: currentSheet.sheet,
                        row: excelRow,
                        propertyTitle: row.property_title,
                        reason: "Property title already exists."
                    });
                    continue;
                }

                // Mark as processed
                uploadedTitles.add(normalizedTitle);
                existingTitles.add(normalizedTitle);
 
                successRecords.push({
                    sheet: currentSheet.sheet,
                    row: excelRow,
                    propertyTitle: row.property_title
                });

                // bulk operation
                bulkOps.push({
                    insertOne: {
                        document: {
                            propertyType: "individual",
                            propertyCategory: currentSheet.category,

                            //Residential details 
                            residentialPropertyType: row.residential_property_type || "",
                            bhkType: row.bhk_type || "",
                            propertyCondition: row.property_condition || "",
                            loanAvailability: row.loan_availability || "",
                            flooringType: row.flooring_type || "",
                            gatedCommunity: row.gated_community || "",

                            //commercial details
                            commercialPropertyType: row.commercial_property_type || "",
                            washrooms: row.washrooms || "",
                            powerBackup: row.power_backup || "",
                            loadUnloadArea: row.loading_unloading_area || "",
                            ceilingHeight: toNumber(row.ceiling_height_in_ft),
                            cabinWorkStation: toNumber(row.number_of_cabin_workstation),
                            electricityLoad: toNumber(row.electricity_load_kva),
                            fireNoc: row.fire_noc || "",
                            commercialParking: row.parking || "",

                            //Land-plot details
                            landPlotPropertyType: row.land_plot_property_type || "",
                            plotArea: toNumber(row.plot_area),
                            unit: row.plot_unit || "",
                            fencing: row.fencing || "",
                            boundaryWall: row.boundary_wall || "",
                            legalClear: row.legal_clear_title || "",
                            roadWidth: toNumber(row.road_width_ft),

                            propertyTitle: row.property_title,
                            listingType: row.listing_type,
                            state: row.state,
                            city: row.city,
                            locality: row.locality,
                            zipCode: row.pincode,
                            propertyArea: toNumber(row.property_area_sq_ft),
                            buildUpArea: toNumber(row.build_up_area_sq_ft),
                            price: toNumber(row.price),
                            priceIn:row.pricein,
                            pricePerSqft:row.price_per_sq_ft,
                            mobile: String(row.mobile),
                            owner: String(row.owner_landlord_name),
                            email: String(row.email),
                            createdBy: _id,
                            description:row.description,
                        }
                    }
                });

                //store in chunk
                if (bulkOps.length >= CHUNK_SIZE) {
                    await Property.bulkWrite(bulkOps);
                    bulkOps = [];
                }
            }
        }

        if (bulkOps.length > 0) {
            await Property.bulkWrite(bulkOps);
        }
        fs.unlink(req.file.path, () => {});

        //delete the previous record
        await PropertyBulkUploadLog.deleteMany({ createdBy: _id });
        //create the latest log record
        await PropertyBulkUploadLog.create({
            createdBy: _id,
            fileName: req.file.originalname,
            totalRecords,
            successCount: successRecords.length,
            failedCount: failedRecords.length,
            status:
                failedRecords.length === 0
                    ? "SUCCESS"
                    : successRecords.length === 0
                    ? "FAILED"
                    : "PARTIAL_SUCCESS",
            successRecords,
            failedRecords
        });

        return res.status(200).json({
            status: "SUCCESS",
            message: "Bulk upload completed.",
            result: {
                totalRecords,
                successCount: successRecords.length,
                failedCount: failedRecords.length,
                successRecords,
                failedRecords
            }
        });
    }
    catch (error) {
        if (req.file) fs.unlink(req.file.path, () => {});
        console.log(error)
        return res.status(500).json({
            status: "FAILED",
            message: error.message
        });
    }
};

module.exports = uploadBulkProperty;
