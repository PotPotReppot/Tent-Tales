const mongoose=require('mongoose');
const reviewSchema=new mongoose.Schema({
    body:String,
    rating:Number,
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
});

module.exports=new mongoose.model('Review',reviewSchema);