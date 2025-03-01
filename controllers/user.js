const User=require('../models/user.js');
module.exports.renderRegisterForm=(req,res)=>{
    res.render('users/register.ejs');
};

module.exports.createUser=async (req,res)=>{
    try{
        const {username,password,email}=req.body;
        const user=new User({email,username});
        const registeredUser=await User.register(user,password);
        req.login(registeredUser,err=>{//As it requires a Callback Function
            if(err){
                return next(err);
            }
            req.flash('success','Welcome to Yelp Camp');
            res.redirect('/campgrounds');
        });
    }
    catch(e){
        req.flash('error',e.message);
        res.redirect('/register');
    }
};

module.exports.renderLoginForm=(req,res)=>{
    res.render('users/login.ejs');
};

module.exports.loginUser=async (req, res, next) => {
    req.flash('success','Welcome Back!');
    const redirectUrl=res.locals.returnTo||'/campgrounds';
    res.redirect(redirectUrl);
};

module.exports.logOut=(req,res)=>{
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
};