const mongoose =  require('mongoose')

const platformRatingSchema = new mongoose.Schema({
    rating : {
        type:Number,
        required:true
    },
    suggestion : {
        type:String,
    },
    userId : {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
},{timestamps : true})

const PlatformRating = mongoose.model('PlatformRating', platformRatingSchema)

module.exports = PlatformRating