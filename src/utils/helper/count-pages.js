// Retrieve the limit from environment variable, or default to 20 if not set
const limit = Number(process.env.LIMIT) ?? 20  

//count the number of pages for pagination
async function countPages(totalDocuments = 0, customLimit) {
    const pageLimit = customLimit ?? limit;
    return Math.ceil(totalDocuments / pageLimit);
};

module.exports = countPages;