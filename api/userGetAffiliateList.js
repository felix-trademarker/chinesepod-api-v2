let Users = require('../repositories/users')
let userService = require('../services/userService')
const { asyncForEach } = require('../frequent')
let _ = require('lodash')

var Model = require('../repositories/_model158')
var rpo = new Model('affiliates')

exports.fn = async function(req, res, next) {
  
  let userId = req.session.userId

  userId= "1275816"
  if (!userId) {
    res.status(401).send('Not Authorized')
  } else {

    // let affiliate = {}

    // affiliate = (await Users.getMysqlProduction(`SELECT * 
    //                                           FROM affiliate_details
    //                                           WHERE user_id=${userId} AND status=1`))[0]

    const userData = await userService.getUser(userId)

    if (
      userData &&
      userData.email &&
      userData.email.endsWith('chinesepod.com')
    ) {
  
      

      let getAndUpdate = (async () => {

        let affiliates = await Users.getMysqlProduction(`SELECT a.id, a.user_id, u.email 
                                              FROM affiliate_details a
                                              LEFT JOIN users u
                                              ON u.id=a.user_id
                                              ORDER BY createdAt ASC`)

        // populate user and events invoice
        await asyncForEach(affiliates, async (affiliate) => {
          affiliate.events = await Users.getMysqlProduction(`SELECT ae.event_fee, ae.user_id, ae.event_type, ae.invoice, ai.status as invoiceStatus
                                                              FROM affiliate_events ae 
                                                              LEFT JOIN affiliate_invoices ai
                                                              ON ai.id=ae.invoice
                                                              WHERE ae.affiliate_id='${affiliate.id}'`)
          // affiliate.user = (await Users.getMysqlProduction(`SELECT * FROM users WHERE id='${affiliate.user_id}'`))[0]
        })
    
        affiliates.map((affiliate) => {
          const amountEarned =
            affiliate.events.map((event) => event.event_fee) || []
          const amountPaid =
            affiliate.events
              .filter((event) => event.invoice && event.invoiceStatus === 'paid')
              .map((event) => event.event_fee) || []
          const amountDue =
            affiliate.events
              .filter(
                (event) => !event.invoice || event.invoiceStatus === 'outstanding'
              )
              .map((event) => event.event_fee) || []
    
          let retData = {
            id: affiliate.id,
            name: affiliate.email,
            referrals: _.uniq(affiliate.events.map((event) => event.user_id))
              .length,
            paidReferrals: _.uniq(
              affiliate.events
                .filter((event) =>
                  ['upgrade', 'upgrade-60d'].includes(event.event_type)
                )
                .map((event) => event.user_id)
            ).length,
            amountEarned: amountEarned.length
              ? amountEarned.reduce((a, b) => a + b)
              : 0,
            amountPaid: amountPaid.length ? amountPaid.reduce((a, b) => a + b) : 0,
            amountDue: amountDue.length ? amountDue.reduce((a, b) => a + b) : 0,
          }

          // add in mongo158
          rpo.upsert({id:retData.id}, retData)
        });
        console.log("updated mongo affiliate list!");
      })

      getAndUpdate()

      // fetch using mongo
      let affiliatesMongo = await rpo.get()

      res.json(affiliatesMongo)
      

    } else {
      res.status(401).send('Not Authorized')
    }



  }
    
}