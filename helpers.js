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
  switch (levelId*1) {
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

exports.oneLevelHigher = function(level) {

  switch (level) {
    case 'newbie':
      return 'elementary';
    case 'elementary':
      return 'preInt';
    case 'preInt':
      return 'intermediate';
    case 'intermediate':
      return 'upperInt';
    case 'upperInt':
      return 'advanced';
    case 'advanced':
      return 'media';
  }

}

exports.levelToChannelId = function(level) {
  switch (level) {
    case 'newbie':
      return 34;
    case 'elementary':
      return 35;
    case 'intermediate':
      return 36;
    case 'upperInt':
      return 37;
    case 'advanced':
      return 38;
    case 'preInt':
      return 180;
    default:
      return '34';
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

exports.accessMapreverse = function(level) {
  switch (level) {
    case 'admin':
      return 1
    case 'premium':
      return 5
    case 'basic':
      return 6
    case 'free':
      return 7
    default:
      return 7
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

