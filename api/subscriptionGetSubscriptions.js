let userService = require('../services/userService')
let Users = require('../repositories/users')



exports.fn = async function(req, res, next) {
    
  let userId = req.session.userId

  if (userId) {

    let subscriptions = await Subscriptions.getMysqlProduction(`
      SELECT
        id,
        user_id as userId,
        subscription_id as subscriptionId,
        subscription_from as subscriptionFrom, 
        subscription_type as subscriptionType, 
        is_old as isOld, 
        product_id as productId, 
        product_length as productLength, 
        status as status, 
        receipt as receipt, 
        date_cancelled as dateCancelled, 
        date_created as dateCreated, 
        next_billing_time as nextBillingTime, 
        last_modified as lastModified, 
        cc_num as ccNum, 
        cc_exp as ccExp, 
        paypal_email as paypalEmail 
      FROM subscriptions 
      WHERE user_id=${userId} and next_billing_time > '${res.app.locals.moment().format()}'
    `);

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
      subscription.product = product

      userSubs.push(subscription)
    }

    let user = await userService.getUser(userId)

    if (user && user.email)
    Users.upsert({id:userId},{ subscriptions: userSubs });
    
    res.json(userSubs);
  } else {
    res.json({});

  }
  
} 
