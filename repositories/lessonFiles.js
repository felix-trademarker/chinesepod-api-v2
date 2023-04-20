let _table = "api.lessons.source.hls";
var Model = require('./_model158')
var defaultModel = new Model(_table)

let conn = require('../config/DbConnect');

const AWS = require('aws-sdk');

let config = {
    accessKeyId: process.env.awsKey,
    secretAccessKey: process.env.awsSecret,
    region: 'us-east-1',
}

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

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


	findDynamoDB : async function(field,value){

        const params = {
            TableName: 'chinesepod-video-streaming',
            FilterExpression: field+'=:video',
            ExpressionAttributeValues: {
                ':video': value
            }
        };
        return new Promise(function(resolve, reject) {

            docClient.scan(params, function (err, data) {

                if (err) {
                    reject(err);

                } else {
                    const { Items } = data;
                    resolve(Items)
                }
            });
        })

    },
    
    




}