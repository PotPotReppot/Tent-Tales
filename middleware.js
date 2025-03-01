const AppError = require('./utils/ExpressError.js');
const { campgroundSchema, reviewSchema } = require('./utils/validateCampground.js');
const Campground = require('./models/campgrounds.js');
const Review = require('./models/review.js');
const User=require('./models/user.js');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        console.log(msg);
        throw new AppError(msg, 400);
    } else {
        next();
    }
}
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        console.log(msg);
        throw new AppError(msg, 400);
    } else {
        next();
    }
}
const isLoggedIn = (req, res, next) => {
    console.log("");
    console.log("");
    console.log("");
    console.log("IS LOGGED IN MIDDLEWARE");
    console.log("");
    console.log("");
    console.log("");
    console.log(req.user);
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You need to login to create a campground');
        return res.redirect('/login');
    }
    next();
}
const storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}
const isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    
    next();
}
const isReviewAuthor = async (req, res, next) => {
    console.log("");
    console.log("");
    console.log("");
    console.log("IS REVIEW AUTHOR MIDDLEWARE");
    console.log("");
    console.log("");
    console.log("");
    const { reviewID } = req.params;
    const review = await Review.findById(reviewID);
    console.log(review);
    console.log(req.user);
    if(req.user){
        const user=await User.findById(req.user._id);
    }
    console.log("");
    console.log("");
    console.log("");
    console.log(req.params);
    console.log("");
    console.log("");
    console.log("");
    if (!review) {
        req.flash('error', 'Review not found');
        return res.redirect(`/campgrounds/${req.params.id}`);
    }
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to delete this review');
        return res.redirect(`/campgrounds/${review.campground}`);
    }
    next();
};

module.exports = { validateCampground, validateReview, isLoggedIn, storeReturnTo, isAuthor , isReviewAuthor};