const Campground = require('../models/campgrounds');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    return res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    console.log("");
    console.log("");
    console.log("");
    console.log("DELETE REVIEW FUNCTION");
    console.log("");
    console.log("");
    console.log("");
    console.log("🔍 Received Request Params:", req.params); // Debugging log

    const { id, reviewID } = req.params;

    if (!id || !reviewID) {
        console.log("❌ Error: Missing Campground ID or Review ID");
        req.flash("error", "Invalid request.");
        return res.redirect("/campgrounds");
    }

    const review = await Review.findById(reviewID);
    if (!review) {
        console.log(`❌ Error: Review ${reviewID} not found.`);
        req.flash("error", "Review not found.");
        return res.redirect(`/campgrounds/${id}`);
    }

    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewID } });
    await Review.findByIdAndDelete(reviewID);

    console.log(`✅ Successfully deleted review ${reviewID}.`);
    req.flash("success", "Review deleted successfully.");
    return res.redirect(`/campgrounds/${id}`);
};
