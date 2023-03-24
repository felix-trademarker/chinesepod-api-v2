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

exports.extractToken = function(req){
    
  let token = req.headers.authorization
  token = token.replace("Bearer ","")

  let data =  JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
  return data.data

}

exports.getLessonColumns = function(){

  return [
    'DISTINCT cc.v3_id as id',
    'title',
    'slug',
    'introduction',
    'hash_code',
    'image',
    'type',
    'level',
    'hosts',
    'publication_timestamp',
    'video',
    'mp3_dialogue',
    'mp3_public',
    'mp3_private',
    'mp3_thefix',
    'pdf1',
    'pdf2',
  ];

}
