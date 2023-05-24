let userService = require('../services/userService')


exports.serveAPI = async function(req, res, next) {

  let response = await userService.getRequestAPI(req, res, next)

  res.json(response.data)

}
