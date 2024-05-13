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

exports.paymentMap = function(subscriptionFrom) {
  switch (subscriptionFrom) {
    case 1:
      return 'Authorize'
    case 2:
      return 'Paypal'
    case 3:
    case 5:
      return 'Apple Pay'
    case 7:
      return 'Stripe'
  }
}

exports.subscriptionTypeMap = function(subscriptionType) {
  switch (subscriptionType) {
    case 1:
      return 'basic'
    case 2:
      return 'premium'
    case 5:
      return 'classroom'
  }
}

exports.subscriptionStatusMap = function(status) {
  switch (status) {
    case 1:
      return 'active'
    case 2:
      return 'cancelled'
    case 3:
      return 'past due'
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
    case 20:
      return 'deleted'
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
    case 'deleted':
      return 20
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

// exports.getLessonSources = async function (req,userId, lesson) { 

//   let accessInfo = await userService.getAccessTypeAndExpiry(userId)

//   let access = accessInfo.type

//   const geo = geoip.lookup(req.ip)

//   if (!lesson.sources) {
//     lesson.sources = { wistia: {} }
//   }

//   if (lesson.sources && lesson.sources.wistia && lesson.video) {
//     lesson.sources.wistia.simplified = lesson.video
//   }

//   try {
//     if (lesson.video && lesson.sources) {
//       const assets = (
//         await LessonFiles.findQuery({id:lesson.id})
//       )[0]
        
//       if (assets && assets.srcVideo) {
//         lesson.sources['hls'] = { simplified: assets.srcVideo }
//       }
//     }
//   } catch (e) {
//     console.log(e)
//   }

//   // check if no HLS / get new hls links
//   let newHls = (await LessonNewSources.findQuery({v3_id:lesson.id }))[0]

//   if (newHls) {
//     // set hls link to the new URL
//     lesson.sources['hls'] = { simplified: newHls.src }
//   }

//   return lesson;
// }

