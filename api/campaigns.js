let Users = require('../repositories/users')

var Model = require('../repositories/_model158')
var defaultModel = new Model('campaigns')

exports.fn = async function(req, res, next) {

  let campaigns = await Users.getMysqlProduction(`
            SELECT DISTINCT(option_value) as campaign FROM user_options
            where option_key='campaignid' and last_update > '2024-01-01'
            order by last_update DESC
            `)

  res.json(campaigns)

  
}

exports.get = async function(req, res, next) {

  let results = await defaultModel.get()

  res.json(results)

  
}

exports.put = async function(req, res, next) {

  console.log(req.body)

  let results = await defaultModel.put(req.body)

  res.json(results)

  
}

exports.edit = async function(req, res, next) {

  let ObjectID = require('mongodb').ObjectID;
  console.log(req.body)

  let results = await defaultModel.upsert({ _id: ObjectID(req.params.id) },req.body)

  res.json(results)

  
}

exports.delete = async function(req, res, next) {

  console.log(req.body)

  let results = await defaultModel.remove(req.body.id)

  res.json(results)

  
}