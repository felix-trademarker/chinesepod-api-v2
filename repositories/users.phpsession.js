let _table = "users.phpsessions";
var Model = require('./_model158')
var defaultModel = new Model(_table)

let conn = require('../config/DbConnect');

var mysql = require('mysql');

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

// module.exports = { baseModel.get }
module.exports = {

    // BASE FUNCTIONS LOCATED IN defaultModel
    get : async function() {
        return await defaultModel.get()
    },
    find : async function(id) {
        return await defaultModel.find(id)
	},
	findQuery : async function(query) {
        return await defaultModel.findQuery(query)
	},
	update : async function(id,data) {
        return await defaultModel.update(id,data)
    },
	put : async function(data) {
        return await defaultModel.put(data)
    },
    upsert : async function(query, data) {
        return await defaultModel.upsert(query, data)
	},
	remove : async function(id) {
        return await defaultModel.remove(id)
    },

    // CUSTOM MYSQL QUERY BELOW ========================
    // ==================================================

	getMysqlProduction : async function(query){
        return await defaultModel.getMysql(conCpodProduction,query)
    },
    
    getMysqlLogging : async function(query){
        return await defaultModel.getMysql(conCpodLogging,query)
    },
    
    getMysql2015 : async function(query){
        return await defaultModel.getMysql(conCpod2015,query)
    },
    
    // ADD CUSTOM FUNCTION BELOW ========================
    // ==================================================



}