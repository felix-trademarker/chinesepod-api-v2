let userService = require('../services/userService')
let Users = require('../repositories/users')
let Lessons = require('../repositories/lessons')
let Course = require('../repositories/courses')
let crmUsersMongoAws = require('../repositories/crmUsersMongoAWS')
let Subscriptions = require('../repositories/subscriptions')
let _ = require('lodash')
const sanitizeHtml = require('sanitize-html')


exports.fn = async function(req, res, next) {
  
  if (!req.query || !req.query.email) {
    res.json({
      status:false,
      message: "Invalid parameters!"
    })
  }
  // let email = req.query.email

  let user = (await Users.getUserByEmailSQL(req.query.email))[0]
  // console.log(user);
  if (!user) {
    res.json({
      status:false,
      message: "Invalid parameters!"
    })
  } else {
    // check mongo records if note in mongo store new record in mongo
    let sqlQuery = `UPDATE users
    SET confirm_status = 1
    WHERE id=${user.id}`;

    let updateResponse = await Users.getMysqlProduction(sqlQuery)
    // console.log("update response ",updateResponse.affectedRows);
    if (updateResponse && updateResponse.affectedRows) {

      let mongoUser = (await Users.findQuery({id:user.id}))[0]

      // ADD OR UPDATE USERS MONGO RECORD
      if (mongoUser) {
        Users.upsert({id:user.id},{confirmStatus:1})
      } else {
        userService.getUserStats(user.id)
      }

      res.json({
        status:true,
        message: "Updated!"
      })
    } else {
      res.json({
        status:false,
        message: "Failed to update record!"
      })
    }
  }
  
} 
