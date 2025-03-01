if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express=require('express');
const app=express();
const path=require('path');
const methodOverride=require('method-override');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const AppError=require('./utils/ExpressError.js');
const wrapAsync=require('./utils/catchError.js');
const {campgroundSchema,reviewSchema}=require('./utils/validateCampground.js');
const Review=require('./models/review.js');
const Joi=require('joi');
const Campground=require('./models/campgrounds.js');
const User=require('./models/user.js');
const campgroundRouter=require('./routes/campground.js');
const reviewRouter=require('./routes/review.js');
const userRouter=require('./routes/user.js');
const session=require('express-session');
const MongoStore = require('connect-mongo');
const flash=require('connect-flash');
const passport=require('passport');
const localStrategy=require('passport-local');
const mongoSanitize=require('express-mongo-sanitize');
const helmet=require('helmet');
const MongoDBStore=require('connect-mongo');

const dbUrl='mongodb://127.0.0.1:27017/yelp-camp'
//const dbUrl=process.env.DB_URL;
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('connection error:', err);
  });

app.set('view engine','ejs');//So that the view engine that is our webpage shown as in HTML form
app.set('views',path.join(__dirname,'views'));//Setting up the address for reader to access the file

app.engine('ejs',ejsMate);//This is used to create a layout


app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize());
app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
    "https://api.maptiler.com/", // add this
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dynfzfxza/",//This should match your cloudinary name(same as from .env file
                "https://images.unsplash.com/",
                "https://api.maptiler.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const store=MongoDBStore.create({
    mongoUrl:dbUrl,
    touchAfter:24*60*60,
    crypto:{
        secret:'thisshouldbeabetterpassword'
    }
})


const sessionConfig={
    name:'session',
    secret:'thisshouldbeabetterpassword',
    resave:false,
    saveUninitialized:true,
    store,
    cookie:{
        httpOnly:true,
        //secure:true,
        expires:Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge:1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 

app.use((req, res, next) => {
    
    res.locals.currentUser=req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


const validateReview=(req,res,next)=>{
    const {error}=reviewSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',');
        console.log(msg);
        throw new AppError(msg,400);
    }
    else{
        next();
    }
}

const validateCampground=(req,res,next)=>{
    const {error}=campgroundSchema.validate(req.body);
    // const result=campgroundSchema.validate(req.body);
    // console.log(result);
    if(error){
        const msg=error.details.map(el=>el.message).join(',');
        console.log(msg);
        throw new AppError(msg,400);
    }
    else{
        next();//This is needed as we want to make it to the next part that is our main route handler(post) request
    }
}

//*******************************CAMPGROUND ROUTES********************************//

app.use('/campgrounds',campgroundRouter)

//*********************************REVIEWS****************************************//

app.use('/campgrounds/:id/reviews',reviewRouter);

//*********************************USERS******************************************//

app.use('/',userRouter);

//*********************************USERS******************************************//
app.get('/',(req,res)=>{
    res.render('campgrounds/home.ejs');
})

app.all('*',(req,res,next)=>{
    console.log("Unmatched Route");
    next(new AppError('Page Not Found',404));
})

app.use((err, req, res, next) => {
    //const {message="Error Occurred",status=500}=err;This is not valid when passing the err has am changing the value of the message 
    //and not the attribute of key message in the err
    const {status=500}=err;
    if(!err.message){
        err.message="OH NO AN ERROR HAS OCCURRED";
    }
    res.status(status).render('campgrounds/error.ejs',{err});
});

app.listen(3000,()=>{
    console.log("LISTENING TO PORT 3000");
})