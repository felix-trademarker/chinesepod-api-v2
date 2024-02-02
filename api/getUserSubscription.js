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
    res.json({})
  }


  let user = (await Users.getUserByEmailSQL(req.query.email))[0]
  let userId = user.id;
  console.log(userId);
  if (!user) {
    res.json({});
  } else { 

    let sqlQuery = `
      SELECT
        id,
        user_id as userId,
        subscription_id as subscriptionId,
        subscription_from as subscriptionFrom, 
        subscription_type as subscriptionType, 
        product_id as productId, 
        status as status, 
        receipt as receipt, 
        date_cancelled as dateCancelled, 
        date_created as dateCreated, 
        next_billing_time as nextBillingTime, 
        last_modified as lastModified
      FROM subscriptions 
      WHERE user_id=${userId} and next_billing_time > '${res.app.locals.moment().format()}'
      `

    let subscriptions = await Subscriptions.getMysqlProduction(sqlQuery);

    // console.log(subscriptions);

    let userSubs = []

    if(subscriptions)
    for (let i=0; i < subscriptions.length; i++) {
      let subscription = subscriptions[i]

      let product = (await Subscriptions.getMysql2015(`
        SELECT 
        currency, list_price as listPrice, current_price as currentPrice, product_title as productTitle, description
        FROM Products
        WHERE product_id=${subscription.productId}
      `))[0]
      // console.log(product)
      
      subscription.paymentMethod = res.app.locals.helpers.paymentMap(subscription.subscriptionFrom)
      // subscription.subscriptionFrom = res.app.locals.helpers.paymentMap(subscription.subscriptionFrom)
      subscription.subscriptionType = res.app.locals.helpers.subscriptionTypeMap(subscription.subscriptionType)
      subscription.status = res.app.locals.helpers.subscriptionStatusMap(subscription.status)

      delete subscription.productId
      delete subscription.subscriptionFrom

      subscription.product = product

      userSubs.push(subscription)
    }

    // let user = await userService.getUser(userId)

    // if (user && user.email)
    // Users.upsert({id:user.id},{ subscriptions: userSubs });

    let access = await userService.getAccessTypeAndExpiry(userId)

    // let retData {
    //   ...access
    //   subscriptions: userSubs
    // }
    access.subscriptions = userSubs
    // console.log(access)
    res.json(access);
  }
  
} 
