async function countAverageRate(data) {
    if (data?.length < 2) {
        return null
    };

    // Initialize variables to store the percentage changes
    let price = 0;
    let percentArray = []

    const afterSort = data.sort((a, b) => a.year - b.year);

    // Iterate through the data to calculate percentage changes
    for (let i = 1; i < afterSort.length; i++) {
        const currentYearPrice = afterSort[i].price;
        const previousYearPrice = afterSort[i - 1].price;

        price = ((currentYearPrice - previousYearPrice) / currentYearPrice) * 100;
        percentArray.push(price);
    }

    let sum = 0;
    for (let i = 0; i < percentArray.length; i++) {
        sum += percentArray[i];
    }

    // Calculate the average rate by dividing the sum by the count
    const averageRate = sum / percentArray.length

    return Number(averageRate.toFixed(2));
};
module.exports = countAverageRate;
