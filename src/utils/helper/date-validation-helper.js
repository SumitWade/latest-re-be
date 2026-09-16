//Date check
const isValidISODate = (dateStr) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;

    // Reject invalid dates like 2025-02-30
    const [y, m, d] = dateStr.split("-").map(Number);
    return (
        date.getUTCFullYear() === y &&
        date.getUTCMonth() + 1 === m &&
        date.getUTCDate() === d
    );
};

//Throw Error
const validationError = (message) => {
    const err = new Error(message);
    err.isValidationError = true;
    return err;
};


//Set system start year or the year we want to give the from date filter
const SYSTEM_START_YEAR = 2020;

const validateDates = (fromDate, toDate) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    //Check the from date is valid date or not
    if (fromDate && !isValidISODate(fromDate)) {
        throw validationError("Invalid From Date format. Use YYYY-MM-DD");
    }
    //Check the to date is valid date or not
    if (toDate && !isValidISODate(toDate)) {
        throw validationError("Invalid To date format. Use YYYY-MM-DD");
    }

    //convert provided date to JS Date() formate
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    // // toDate cannot be in future
    // if (to && to > today) {
    //     throw validationError("To Date cannot be in the future");
    // }

    // fromDate cannot be after toDate
    if (from && to && from > to) {
        throw validationError("From Date cannot be greater than To Date");
    }

    // fromDate not before system start year
    if (from) {
        const minDate = new Date(SYSTEM_START_YEAR, 0, 1);
        if (from < minDate) {
            throw validationError(`From Date cannot be before year ${SYSTEM_START_YEAR}`);
        }
    }
};

module.exports = validateDates