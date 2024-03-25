let userService = require('../services/userService')
let Users = require('../repositories/users')


exports.fn = async function(req, res, next) {

  let inputs = {
    userId: req.params.id,
    dash: req.query.dash
  }

  let user = await userService.logUserDash(inputs)

  let userMongo = (await Users.findQuery({id:user.id}))[0]

  res.json(userMongo)
  
}