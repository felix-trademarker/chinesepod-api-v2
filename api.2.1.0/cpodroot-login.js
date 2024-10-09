let Users = require('../repositories/users')
// let axios = require('axios')
const jwToken = require('jsonwebtoken');
let randomToken = require('rand-token');
var ModelRedis = require('../repositories/_modelRedis')
let redisClient = new ModelRedis('users.login')

var Model = require('./../repositories/_model158')
let userService = require('./../services/userService')


exports.fn = async function(req, res, next) {
  
  let loginValidate;

  loginValidate = await userService.validateLogin(req, res)

  console.log(loginValidate)

}
