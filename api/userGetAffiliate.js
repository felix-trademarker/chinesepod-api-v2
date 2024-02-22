let Users = require('../repositories/users')
let _ = require('lodash')
let userService = require('../services/userService')

exports.fn = async function(req, res, next) {
  
  if (!this.req.session) {
    throw 'invalid'
  }

  const { userId } = this.req.session

  if (!userId) {
    return this.res.status(401).send('Not Authorized')
  }

  let affiliate = {}
  affiliate = await AffiliateDetails.findOne({
    user_id: userId,
    status: 1,
  })

  const userData = await User.findOne(userId).select('email')

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
    return this.res.status(404).send('Not Found')
  }

  return affiliate
    
}