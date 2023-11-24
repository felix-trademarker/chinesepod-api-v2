const MongoClient = require( 'mongodb' ).MongoClient;
const mongoose = require('mongoose');
const _variables = require( './variables' );
var mysql = require('mysql');
const redis = require('redis');

var _db158,_dbAWS;

var conCpodProduction = mysql.createConnection({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DBNAME,
});

var conCpodLogging = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: "chinesepod_logging",
});

var conCpod2015 = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: "chinesepod2015",
});

var redisClient = redis.createClient({
  host: process.env.REDISHOST,
  port: process.env.REDISPORT
});



module.exports = {

  connectToServer158: function( callback ) {
    MongoClient.connect( _variables.mongoURL158 ,  _variables.mongoOptions, function( err, client ) {
      _db158  = client.db('chinesepod');
      return callback( err );
    } );
  },

  getDb158: function() {
    return _db158;
  },

  connectToServerAWS: function( callback ) {
    MongoClient.connect( _variables.mongoURL158 ,  _variables.mongoOptions, function( err, client ) {
      _dbAWS  = client.db('bigfoot');
      return callback( err );
    } );
  },

  getDbAWS: function() {
    return _dbAWS;
  },


  getDbMySqlProduction: function() {
    return conCpodProduction;
  },

  getDbMySqlLogging: function() {
    return conCpodLogging;
  },

  getDbMySql2015: function() {
    return conCpod2015;
  },

  getRedisConn: async function() {

    return redisClient;

  },

  prepareRedisConn: async function() {

    await redisClient.connect();
    console.log("connected!");
  },


};