const mongoose = require("mongoose");

const priceTrendSchema = new mongoose.Schema({
    year: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    month: {
        type: String,
        required: true,
    },
    monthValue: {
        type: Number,
        required: true,
    }
},
    { _id: false }
);


const areaPriceTrendSchema = new mongoose.Schema({
    area: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    priceTrends: {
        type: [priceTrendSchema],
        default: []
    },
    trendPercentage: {
        type: Number,
        default: 0
    },
    isIncrease: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
);

const AreaPriceTrend = mongoose.model("AreaPriceTrend", areaPriceTrendSchema);

module.exports = AreaPriceTrend;