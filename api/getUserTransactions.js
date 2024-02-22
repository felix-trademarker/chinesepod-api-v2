let Users = require('../repositories/users')
let _ = require('lodash')
let userService = require('../services/userService')

exports.fn = async function(req, res, next) {
  let userId = req.session.userId
  let inputs = req.session.inputs
  
  // userId='1265569'

  if (!userId) {
    res.json({})
  }
  
    let transactions = await Users.getMysqlProduction(`SELECT *, date_created as createdAt
                                                        FROM transactions 
                                                        WHERE user_id=${userId}
                                                        ORDER BY date_created DESC
                                                        LIMIT 20`)
    
    let returnValue = transactions.map((i) =>
      _.pick(i, ['id', 'transaction_id', 'createdAt', 'billed_amount'])
    )

    // fetch related table sunscriptions
    for (let i=0; i < transactions.length; i++) {
      transactions[i].subscription = await Users.getMysqlProduction(`SELECT *
                                                                    FROM subscriptions
                                                                    WHERE subscription_id='${transactions[i].subscription_id}'`)
    }

    // user
    let userMongo = (await Users.findQuery({id:parseInt(userId)}))[0]
    // console.log(userMongo);
    if (userMongo) 
    Users.upsert({id:userMongo.id},{transactions: transactions})
    // delete userMongo._id
    // userMongo.transactions = transactions

    // Users.upsert({id:userMongo.id, email: userMongo.email},userMongo)

    // return expected values
    res.json(returnValue)
}