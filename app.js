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
conn.connectToServerAWS( function( err, client ) { // MAIN MONGO START
conn.connectToServer158( async function( err, client ) { // MAIN MONGO START

  await conn.prepareRedisConn();
  
  if (err) console.log(err);
  // start the rest of your app here
  
  // test block start
  // var ModelRedis = require('./repositories/_modelRedis')
  // let redisClient = new ModelRedis('lessons')
  // console.log(await redisClient.get('mykey'))

  // test block end

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

  app.use('/api/v2',middleware.checkAuth, apiRouter);



  // userService.udpateLessonFiles();
  // userService.findAWSFile('0bv22rnq8c.mp4')
  // userService.getUserStats(1292735)
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
