const mongoose = require('mongoose');

const localitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    city: {
        type: String,
        default: 'Nagpur',
        trim: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: false
        },
        coordinates: {
            type: [Number],
            required: false // Optional GeoJSON format for spatial queries [longitude, latitude]
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Pre-save hook to populate the GeoJSON location field automatically if latitude and longitude are provided
localitySchema.pre('save', function(next) {
    if (this.longitude && this.latitude) {
        this.location = {
            type: 'Point',
            coordinates: [this.longitude, this.latitude]
        };
    }
    next();
});

const Locality = mongoose.model('Locality', localitySchema);

module.exports = Locality;
