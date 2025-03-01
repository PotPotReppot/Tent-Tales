const Campground=require('../models/campgrounds.js');
const Review=require('../models/review.js');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
const {cloudinary}=require('../cloudinary/index.js');

module.exports.index=async (req, res, next) => {
    const campgrounds = await Campground.find({});
    return res.render('campgrounds/index.ejs', { campgrounds });
};

module.exports.renderNewForm=(req, res, next) => {
    return res.render('campgrounds/new.ejs');
};

module.exports.createCampground=async (req, res, next) => {
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    console.log(req.files);
    // if(!req.body.campground){//This doesn't work if I send a request through the postman
    //     throw new AppError("Invalid Campground Data",400);
    // }//Also we can prevent this by doing req.body.campground.price,title,etc but that is
    // bad cause I have to write details abput everything.
    const campground = new Campground(req.body.campground);
    campground.geometry=geoData.features[0].geometry;
    campground.images=req.files.map(f => ({url: f.path,filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'The new campground has been successfully created');
    return res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
    console.log("🔍 Campground ID:", req.params.id);
    try {
        const campground = await Campground.findById(req.params.id)
        .populate('author')
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        });
        if (!campground) {
            req.flash("error", "Campground not found!");
            return res.redirect("/campgrounds");
        }
        return res.render("campgrounds/show", { campground });
    } catch (err) {
        console.log("❌ ERROR:", err);
        req.flash("error", "Something went wrong.");
        return res.redirect("/campgrounds");
    }
};


module.exports.renderEditForm=async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot Find Campground');
        return res.redirect('/campgrounds');
    }
    return res.render('campgrounds/edit.ejs', { campground });
};

module.exports.editCampground=async (req, res, next) => {
    console.log(req.files);
    console.log(req.body);
    const { id } = req.params;
    // In this request there is the use of spread operator which is most important part here //
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, {new : true});
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    campground.geometry = geoData.features[0].geometry;
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    
    const imgs=req.files.map(f => ({url: f.path,filename: f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    req.flash('success','Campground has been updated successfully!');
    return res.redirect(`/campgrounds/${id}`);
};

// module.exports.editCampground=async (req, res, next) => {
//     const { id } = req.params;
//     const campground = await Campground.findById(id);
//     if (!campground) {
//         req.flash('error', 'Cannot Find Campground');
//         return res.redirect('/campgrounds');
//     }
// // In this request there is the use of spread operator which is most important part here //
// // ************************************************************************************* //
//     await Campground.findByIdAndUpdate(id, { ...req.body.campground });
//     res.redirect(`/campgrounds/${id}`);
// };

module.exports.deleteCampground=async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot Find Campground');
        return res.redirect('/campgrounds');
    }
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted successfully');
    return res.redirect('/campgrounds');
};