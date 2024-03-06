let Users = require('../repositories/users')
let userService = require('../services/userService')
let _ = require('lodash')

exports.fn = async function(req, res, next) {
  
  let userId = req.session.userId
  let inputs = req.body
  inputs.id = req.params.id

  // console.log(userId)
  // console.log(req.params)

  // userId= "1275816"
  if (!userId) {
    res.status(401).send('Not Authorized')
  } else {

    let affiliate = {}

    const userData = await userService.getUser(userId)
    // console.log(userData);
    if (
      userData &&
      userData.email &&
      userData.email.endsWith('chinesepod.com')
    ) {


      affiliate = (await Users.getMysqlProduction(`SELECT ad.*, u.name, u.email
                                              FROM affiliate_details ad
                                              LEFT JOIN users u
                                              ON u.id=ad.user_id
                                              WHERE ad.id='${inputs.id}'`))[0]

      let events = await Users.getMysqlProduction(`SELECT ae.*, u.email
                                              FROM affiliate_events ae
                                              LEFT JOIN users u
                                              ON u.id=ae.user_id
                                              LEFT JOIN affiliate_invoices ai
                                              ON ai.id=ae.invoice
                                              WHERE ae.affiliate_id='${inputs.id}'
                                              AND ae.createdAt >= '${res.app.locals.moment(inputs.fromDate).format()}'
                                              AND ae.createdAt <= '${res.app.locals.moment(inputs.toDate).format()}'`)
// console.log('affiliate',affiliate);
      // const events = await AffiliateEvents.find({
      //   affiliate_id: inputs.id,
      //   and: [
      //     {
      //       createdAt: { '>=': inputs.fromDate },
      //     },
      //     {
      //       createdAt: { '<=': inputs.toDate },
      //     },
      //   ],
      // })
        // .sort('createdAt DESC')
        // .populate('user_id')
        // .populate('invoice')
      // console.log(affiliate.options)
      res.json({
        ...JSON.parse(affiliate.options),
        // ..._.pick(affiliate.user_id, ['name', 'email', 'id']),
        name: affiliate.name,
        email: affiliate.email,
        id: affiliate.user_id,
        tag: affiliate.tag,
        events: events.map((event) => {
          event.event_details = JSON.parse(event.event_details)
          return {
            email: event.email,
            id: event.user_id,
            event_id: event.id,
            ..._.pick(event, [
              'event_type',
              'event_fee',
              'invoice',
              'event_details',
              'createdAt',
            ]),
          }
        }),
      })
    } else {
      res.status(401).send('Not Authorized')
    }

    // if (!affiliate) {
    //   res.status(401).send('Not Authorized')
    // }

    // res.json(affiliate)

  }
    
}