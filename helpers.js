const _ = require("lodash");  
let axios = require('axios');
const https = require('https')


exports.toObject = function(arr) {
  var rv = {}
  for (let r=0; r < arr.length; r++) { let option = arr[r]
    rv[option.option_key] = option.option_value
  }

  return rv
}

exports.intToLevel = function(levelId) {
  switch (levelId) {
    case 1:
      return 'newbie';
    case 2:
      return 'elementary';
    case 6:
      return 'preInt';
    case 3:
      return 'intermediate';
    case 4:
      return 'upperInt';
    case 5:
      return 'advanced';
    default:
      return 'newbie'
  }
}

exports.accessMap = function(level) {
  switch (level) {
    case 1:
      return 'admin'
    case 5:
      return 'premium'
    case 6:
      return 'basic'
    case 7:
      return 'free'
    default:
      return 'free'
  }
}

exports.getCurrentUser = async function(req, res, next){
    
  var options = {
    'headers': {
      'Cookie': req.headers.cookie
    }
  };
  let url = 'https://www.chinesepod.com/api/v1/entrance/get-user'

  let currentUser = await axios.get(url,options)

  return currentUser.data

}

exports.extractToken = function(req){
    
  let token = req.headers.authorization
  token = token.replace("Bearer ","")

  let data =  JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
  return data.data

}

exports.getDomain = function(){
  return "https://www.chinesepod.com"
}