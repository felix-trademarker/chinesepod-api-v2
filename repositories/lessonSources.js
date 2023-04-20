let _table = "api.lessons.sources";
var Model = require('./_model158')
var defaultModel = new Model(_table)

let conn = require('../config/DbConnect');

// module.exports = { baseModel.get }
module.exports = {

    // BASE FUNCTIONS LOCATED IN defaultModel
    count : async function() {
        return await defaultModel.count()
    },
    get : async function() {
        return await defaultModel.get()
    },
    find : async function(id) {
        return await defaultModel.find(id)
	},
	findQuery : async function(query) {
        return await defaultModel.findQuery(query)
    },
    paginate : async function(skip,limit) {
        return await defaultModel.paginate(skip,limit)
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
        return await defaultModel.getMysql(conn.getDbMySqlProduction(),query)
    },
    
    getMysqlLogging : async function(query){
        return await defaultModel.getMysql(conn.getDbMySqlLogging(),query)
    },
    
    getMysql2015 : async function(query){
        return await defaultModel.getMysql(conn.getDbMySql2015(),query)
    },
    
    // ADD CUSTOM FUNCTION BELOW ========================
    // ==================================================



}