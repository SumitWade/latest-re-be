const PurchaseSubscription = require("../../../model/subscription-purchase-model");

const expireSubscriptions = async () => {
    const now = new Date();
    const result = await PurchaseSubscription.updateMany(
        {
            isPurchaseActive: true,
            endDate: { $lt: now }
        },
        {
            $set: {
                isPurchaseActive: false,
                status: "Expired"
            }
        }
    );
    return result;
};

module.exports = expireSubscriptions;