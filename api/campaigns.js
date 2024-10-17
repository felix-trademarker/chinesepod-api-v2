let Users = require('../repositories/users')

var Model = require('../repositories/_model158')
var defaultModel = new Model('campaign.monitoring')

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

  if (results)
  for (let i=0; i < results.length; i++) {
    results[i].users = await Users.getMysqlProduction(`
            SELECT DATE_FORMAT(u.last_update, "%Y-%m-%d") as signup_date, COUNT(*) as total_records, us.usertype_id FROM user_options u
            LEFT JOIN user_site_links us
            ON us.user_id = u.user_id
            where option_key='campaignid' and option_value='${results[i].trackingID}'
            group by DATE(u.last_update), us.usertype_id
            order by DATE(u.last_update) DESC
            `)
  }

  res.json(results)

  
}

exports.put = async function(req, res, next) {

  console.log(req.body)

  let results = await defaultModel.put(req.body)

  res.json(results)

  
}

exports.edit = async function(req, res, next) {

  let ObjectID = require('mongodb').ObjectID;
  

  // let updateData = req.body
  let id = req.body._id
  delete req.body._id
  console.log("EDIT",id,req.body)
  let results = await defaultModel.update(id,req.body)

  res.json(results)

  
}

exports.delete = async function(req, res, next) {

  console.log(req.body)

  let results = await defaultModel.remove(req.body._id)

  res.json(results)

  
}

exports.addUserWithCampaign = async function(req, res, next) {

  console.log(req.body)
  let user = (await Users.getMysqlProduction(`SELECT id FROM users WHERE email='${req.body.emailAddress}'`))[0]
  // let results = await defaultModel.put(req.body)
  if (user) {
    console.log(user)
    let userOptions = (await Users.getMysqlProduction(`SELECT id FROM user_options WHERE user_id='${user.id}' AND option_key='campaignId'`))[0]
    console.log(userOptions)
    // insert only if user doesn't register to any campaign
    if (!userOptions) {
      console.log("adding user in campaign")
      let query = (`INSERT INTO user_options SET ?`)
      let resuseroptions = await Users.getMysqlProduction( query, {
        user_id: user.id,
        option_key: 'campaignId',
        option_value: req.body.campaignId
      } )
  
      console.log(resuseroptions)
    }
    
  } else {
    console.log("user not found")
  }
  res.json(user)

  
}