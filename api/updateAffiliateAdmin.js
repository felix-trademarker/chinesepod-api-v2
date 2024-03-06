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


      if (!affiliate) throw 'invalid'

      const { name, address, paymentInfo } = inputs

      if (name) {
        // await User.updateOne(affiliate.user_id.id).set({ name })
        // update users name
        await Users.getMysqlProduction(`UPDATE users
                                        SET name='${name}'
                                        WHERE id='${affiliate.user_id}'`)
      }

      // await AffiliateDetails.updateOne(affiliate.id).set({
      //   options: { address, paymentInfo },
      // })

      let optionData = JSON.stringify({ address, paymentInfo })

      await Users.getMysqlProduction(`UPDATE affiliate_details
                                      SET options='${optionData}'
                                      WHERE id='${affiliate.id}'`)

      affiliate = (await Users.getMysqlProduction(`SELECT ad.*, u.name, u.email
                                      FROM affiliate_details ad
                                      LEFT JOIN users u
                                      ON u.id=ad.user_id
                                      WHERE ad.id='${inputs.id}'`))[0]

      res.json({
        ...JSON.parse(affiliate.options),
        ..._.pick(affiliate, ['name', 'email']),
        id: affiliate.user_id
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