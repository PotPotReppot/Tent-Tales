const express=require('express');
const router=express.Router();
const passport=require('passport');
const User=require('../models/user.js');
const users=require('../controllers/user.js');
const AppError=require('../utils/ExpressError.js');
const wrapAsync=require('../utils/catchError.js');
const {storeReturnTo}=require('../middleware.js');

router.route('/register')
    .get(users.renderRegisterForm)
    .post(wrapAsync(users.createUser));
router.route('/login')
    .get(users.renderLoginForm)
    .post(storeReturnTo,passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),wrapAsync(users.loginUser));
router.get('/logout',users.logOut);


module.exports=router;