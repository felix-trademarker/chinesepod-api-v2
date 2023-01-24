// CALL ENV FILE
require('dotenv').config()

var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session')

let middleware = require('./middleware')
let userService = require('./services/userService')


var app = express();

app.use(cookieParser());
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
conn.connectToServer158( function( err, client ) { // MAIN MONGO START


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
  app.use('/api/v2',middleware.checkAuth, apiRouter);

  // userService.migrateSession()

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
