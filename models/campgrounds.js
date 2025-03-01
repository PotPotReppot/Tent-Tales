const mongoose=require('mongoose');
const Review=require('./review');
const { coordinates } = require('@maptiler/client');

const ImageSchema=new mongoose.Schema({
    url:String,
    filename:String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200,h_200,c_fill');
});

const opts={toJSON : { virtuals : true } , toObject: { virtuals: true }};

const campgroundSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    images:[ImageSchema],
    price:Number,
    description:String,
    location:String,
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
},opts);

campgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `<a href="/campgrounds/${this._id}"><strong>${this.title}</strong></a>`;
});

campgroundSchema.post('findOneAndDelete',async function(campground){
    if(campground){
        if(campground.reviews.length){
            const res=await Review.deleteMany({_id:{$in:campground.reviews}});
        }
    }
});
const Campground=new mongoose.model('Campground',campgroundSchema);
module.exports=Campground;