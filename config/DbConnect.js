const MongoClient = require( 'mongodb' ).MongoClient;
const mongoose = require('mongoose');
const _variables = require( './variables' );

var _db158,_dbAWS;
console.log(_variables.mongoURL);
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
  }


};