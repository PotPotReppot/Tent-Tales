const express=require('express');
const router=express.Router({mergeParams:true}); //This is used because in the main app.js we define the initial
//having /:id in it but the server treats it seprately so for that to be accessible in this router file we need
//merge params set to true
const AppError=require('../utils/ExpressError.js');
const wrapAsync=require('../utils/catchError.js');
const Campground=require('../models/campgrounds.js');
const Review=require('../models/review.js');
const reviews=require('../controllers/reviews.js');
const {campgroundSchema,reviewSchema}=require('../utils/validateCampground.js');
const {validateReview,isLoggedIn,isReviewAuthor}=require('../middleware.js');


router.post('',isLoggedIn,validateReview,wrapAsync(reviews.createReview));

router.delete('/:reviewID',isLoggedIn,isReviewAuthor,wrapAsync(reviews.deleteReview));


module.exports=router;