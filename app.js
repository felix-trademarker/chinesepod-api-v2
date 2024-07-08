// CALL ENV FILE
require('dotenv').config()

var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session')
var bodyParser = require('body-parser')
let middleware = require('./middleware')
let userService = require('./services/userService')


var cors = require('cors')

var app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'qweasdzxcrtyfghvbn',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

app.set('view engine', 'ejs');

// APP  CONTAINER =========== >> 
let conn = require('./config/DbConnect');
conn.connectToServerAWS( function( err, client ) { // AWS MONGO START
conn.connectToServer158( async function( err, client ) { // MAIN MONGO START

  await conn.prepareRedisConn();
  
  if (err) console.log(err);
  // start the rest of your app here

  // Create our number formatter.
  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  
  app.locals.formatter = formatter;
  app.locals.moment = require('moment');
  app.locals.helpers = require('./helpers');
  app.locals.variables = require('./config/variables');

  console.log("APP RUNNING...");


  var apiRouter = require('./routes/api');
  var apiRouter2 = require('./routes/apiCustom');
  var apiProxyRouter = require('./routes/proxy');
  app.use('/api/v2/custom', apiRouter2);
  app.use('/api/v2/proxy', apiProxyRouter);

  
  // TEST TO CREATE 1 FILE FOR EACH API

  // USER DASHBOARD API
  app.get('/api/v2/dashboard/get-info',middleware.checkAuth, require('./api/getInfo').fn);
  app.get('/api/v2/dashboard/get-stats',middleware.checkAuth, require('./api/getStats').fn);
  app.get('/api/v2/dashboard/course-lessons',middleware.checkAuth, require('./api/courseLessons').fn);
  app.get('/api/v2/dashboard/user-courses',middleware.checkAuth, require('./api/userCourses').fn);
  app.get('/api/v2/dashboard/history',middleware.checkAuth, require('./api/history').fn);
  app.get('/api/v2/dashboard/bookmarks',middleware.checkAuth, require('./api/bookmarks').fn);
  app.get('/api/v2/dashboard/more-courses',middleware.checkAuth, require('./api/moreCourses').fn);
  app.get('/api/v2/dashboard/all-lessons',middleware.checkAuth, require('./api/allLessons').fn);
  app.get('/api/v2/dashboard/get-bookmarked-lessons',middleware.checkAuth, require('./api/getBookMarkedLessons').fn);
  
  app.get('/api/v2/dashboard/get-studied-lessons',middleware.checkAuth, require('./api/getStudiedLessons').fn);
  app.get('/api/v2/dashboard/all-courses',middleware.checkAuth, require('./api/allCourses').fn);
  app.get('/api/v2/dashboard/all-playlists',middleware.checkAuth, require('./api/allPlaylists').fn);
  app.get('/api/v2/dashboard/onboarding/questions',middleware.checkAuth, require('./api/onboardingQuestions').fn);

  app.get('/api/v2/dashboard/get-suggestions',middleware.checkAuth, require('./api/getSuggestions').fn);
  app.get('/api/v2/dashboard/get-course',middleware.checkAuth, require('./api/getCourse').fn);
  app.get('/api/v2/dashboard/get-all-lessons',middleware.checkAuth, require('./api/getAllLessons').fn);

  // LESSON API
  app.get('/api/v2/lessons/get-dialogue',middleware.checkAuth, require('./api/lessonGetDialogue').fn);
  app.get('/api/v2/lessons/get-vocab',middleware.checkAuth, require('./api/lessonGetVocab').fn);
  app.get('/api/v2/lessons/get-details/:id',middleware.checkAuth, require('./api/lessonGetDetailsId').fn);
  app.get('/api/v2/lessons/get-expansion',middleware.checkAuth, require('./api/lessonGetExpansion').fn);
  app.get('/api/v2/lessons/get-lesson',middleware.checkAuth, require('./api/lessonGetLesson').fn);
  app.get('/api/v2/lessons/get-comments',middleware.checkAuth, require('./api/lessonGetComments').fn);
  app.get('/api/v2/lessons/get-grammar',middleware.checkAuth, require('./api/lessonGetGrammar').fn);
  app.get('/api/v2/lessons/get-downloads',middleware.checkAuth, require('./api/lessonGetDownloads').fn);
  // LESSON EXERCISES QUESTIONS
  app.get('/api/v2/exercises/get-questions',middleware.checkAuth, require('./api/exercisesGetExercises').fn);
  // VOCABULARY DECKS
  app.get('/api/v2/vocabulary/decks',middleware.checkAuth, require('./api/vocabularyGetAllDecks').fn);

  // ACCOUNT
  app.get('/api/v2/account/subscription/subscriptions',middleware.checkAuth, require('./api/subscriptionGetSubscriptions').fn);
  app.get('/api/v2/account/subscription/transactions', require('./api/getUserTransactions').fn);

  // AFFILIATES API
  app.get('/api/v2/affiliates/affiliate',middleware.checkAuth, require('./api/userGetAffiliate').fn);
  app.get('/api/v2/affiliates/users',middleware.checkAuth, require('./api/userGetAffiliateList').fn);
  app.post('/api/v2/affiliates/users/:id',middleware.checkAuth, require('./api/getAffiliateAdmin').fn);
  app.put('/api/v2/affiliates/users/:id',middleware.checkAuth, require('./api/updateAffiliateAdmin').fn);


  app.get('/api/v2/tutorials/android-intro-video', require('./api/android-intro-tutorials').fn);


  // custom account api
  app.get('/api/v2/account/update/subscriptions', require('./api/userUpdateSubscription').fn);
  app.get('/api/v2/account/delete/:id', require('./api/setUserDeleted').fn);

  // USED IN PRINTER APP TO PRINT GIFT LABELS
  app.get('/api/v2/labels/gift-packages',middleware.checkAuth, require('./api/labelgiftPackages').fn);

  // CUSTOM API 
  app.get('/api/v2/user/confirm-email',middleware.checkAuth, require('./api/setEmailConfirm').fn);
  app.get('/api/v2/user/subscriptions',middleware.checkAuth, require('./api/getUserSubscription').fn);
  app.get('/api/v2/user/log-dash/:id/', require('./api/userLogDash').fn);

  app.get('/api/v2/lesson/popularity', userService.getlessonstats);

  
  // app.use('/api/v2',middleware.checkAuth, apiRouter);

  // userService.udpateLessonFiles();
  // userService.findAWSFile('0bv22rnq8c.mp4')
  // userService.updateLessonV3Id()
  // userService.getAccessTypeAndExpiry('1168343')
  // userService.updateLessonURL()
  // userService.checknewpaidusers()
  // userService.getlessonstats()
  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function(err, req, res, next) {

    
    // set locals, only providing error in development
    if ( process.env.ENVIRONMENT == "dev" ) {

      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'dev' ? err : {};
      res.status(err.status || 500);
      res.render('error');

    } else {
      // errorLogService.logger(err.status || 500,err.message,req)
      res.status(err.status || 500);
      // res.redirect("/")
    }
  });


  
}); // AWS MONGO CLOSE
}); // AWS MONGO CLOSE



module.exports = app;
