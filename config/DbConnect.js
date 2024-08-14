const MongoClient = require( 'mongodb' ).MongoClient;
const mongoose = require('mongoose');
const _variables = require( './variables' );
var mysql = require('mysql');
const redis = require('redis');

var _db158,_db158BF,_dbAWS;

var conCpodProduction = mysql.createConnection({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DBNAME,
});

var conCpodProduction2 = mysql.createConnection({
  host: process.env.DBHOST2,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DBNAME,
});

var conCpodLogging = mysql.createConnection({
    host: 'cpod-testdb-cluster.cluster-cx6o0r5nidjs.us-east-1.rds.amazonaws.com',
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

var conCpodAssessment = mysql.createConnection({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: "assessment",
});

var redisClient = redis.createClient({
  host: process.env.REDISHOST,
  port: process.env.REDISPORT
});



module.exports = {

  connectToServer158: function( callback ) {
    MongoClient.connect( _variables.mongoURL158 ,  _variables.mongoOptions, function( err, client ) {
      _db158  = client.db('chinesepod');
      _db158BF  = client.db('bigfoot');
      return callback( err );
    } );
  },

  getDb158: function() {
    return _db158;
  },

  getDb158BF: function() {
    return _db158BF;
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

  getDbMySqlProduction2: function() {
    return conCpodProduction2;
  },

  getDbMySqlLogging: function() {
    return conCpodLogging;
  },

  getDbMySql2015: function() {
    return conCpod2015;
  },

  getDbMySqlAssessment: function() {
    return conCpodAssessment;
  },

  getRedisConn: async function() {

    return redisClient;

  },

  prepareRedisConn: async function() {

    await redisClient.connect();
    console.log("connected!");
  },


};