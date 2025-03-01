const express = require('express');
const router = express.Router();
const AppError = require('../utils/ExpressError.js');
const wrapAsync = require('../utils/catchError.js');
const Campground = require('../models/campgrounds.js');
const campgrounds = require('../controllers/campgrounds.js');
const { campgroundSchema, reviewSchema } = require('../utils/validateCampground.js');
const {validateCampground, isLoggedIn ,isAuthor} = require('../middleware.js');
const {storage}=require('../cloudinary/index.js');
const multer=require('multer');
const upload = multer({storage});

router.route('/')
    .get(wrapAsync(campgrounds.index))
    .post(isLoggedIn,upload.array('images'),validateCampground,wrapAsync(campgrounds.createCampground));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(wrapAsync(campgrounds.showCampground))
    .put(isLoggedIn,isAuthor,upload.array('images'),validateCampground, wrapAsync(campgrounds.editCampground))
    .delete(isLoggedIn,isAuthor, wrapAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn,isAuthor, wrapAsync(campgrounds.renderEditForm));

module.exports = router;
