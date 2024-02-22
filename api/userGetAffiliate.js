let Users = require('../repositories/users')
let userService = require('../services/userService')

exports.fn = async function(req, res, next) {
  
  let userId = req.session.userId

  // userId= "1275816"
  if (!userId) {
    res.status(401).send('Not Authorized')
  } else {

    let affiliate = {}

    affiliate = (await Users.getMysqlProduction(`SELECT * 
                                              FROM affiliate_details
                                              WHERE user_id=${userId} AND status=1`))[0]

    const userData = await userService.getUser(userId)

    if (
      userData &&
      userData.email &&
      userData.email.endsWith('chinesepod.com')
    ) {
      if (affiliate) {
        affiliate.isTeam = true
      } else {
        affiliate = { isTeam: true }
      }
    }

    if (!affiliate) {
      res.status(401).send('Not Authorized')
    }

    res.json(affiliate)

  }
    
}