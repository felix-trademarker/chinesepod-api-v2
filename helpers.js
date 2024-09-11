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
  console.log(data)
  if (data && data.data) {
    data.data.token = token
    return data.data
  }

  if (data && data.userId) {
    data.token = token
    return data
  }

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

exports.passwordHash = function(inputs){

  let Md5 = require("crypto-js/md5");
  let base64 = require("crypto-js/enc-base64");

  let key = 'sgsd!aadsf6699#dsf;,asdga!6fffkogasdfppyhhav6';
  key = Md5(key);
  let keyLength = key.toString().length;
  let string = inputs.methdod === 'D'
    ? base64.parse(inputs.password)
    : Md5(inputs.password + key).toString().substr(0, 8) + inputs.password;
  const stringLength = string.length;
  let result = '';
  let rndkey = [];
  let box = [];
  for (let i = 0; i <= 255; i++) {
    rndkey[i] = (key.toString())[i % keyLength].charCodeAt(0);
    box[i]    = i;
  }
  for (let i = 0, j = 0, tmp = 0; i < 256; i++) {
    j = (j + box[i] + rndkey[i]) % 256;
    tmp = box[i];
    box[i] = box[j];
    box[j] = tmp;
  }
  for (let i = 0, a = 0, j = 0, tmp = 0; i < stringLength; i++) {
    a = (a + 1) % 256;
    j = (j + box[a]) % 256;
    tmp = box[a];
    box[a] = box[j];
    box[j] = tmp;
    result  += (String.fromCharCode(string[i].charCodeAt(0) ^ (box[(box[a] + box[j]) % 256])));
  }
  return Buffer.from(result, 'binary').toString('base64').replace(new RegExp('=','g'),'');

}

// exports.createPhpSession = function(inputs){
//   let userId = inputs.userId;
//   let currentTime = new Date();
//   let expiryTime = new Date(currentTime.getTime() + 365.25 * 24 * 60 * 60 * 1000); //Creation + 1 year
//   let sessionStart = currentTime.toISOString().split('T').join(' ').split('.')[0];
//   let sessionEnd = expiryTime.toISOString().split('T').join(' ').split('.')[0];

//   let userSiteLink = (await UserSiteLinks.find({ user_id: userId, site_id: 2})
//     .sort('updatedAt DESC')
//     .limit(1))[0];

//   if (!userSiteLink) {
//     return ''
//   }

//   let groupId = 7;

//   if (userSiteLink) {
//     groupId = userSiteLink.usertype_id;
//   }

//   let groupName = 'free';
//   switch (groupId) {
//     case 1:
//       groupName = 'admin';
//       break;
//     case 5:
//       groupName = 'premium';
//       break;
//     case 6:
//       groupName = 'basic';
//       break;
//     case 7:
//       groupName = 'free';
//       break;
//   }

//   let sessionData = `user|a:8:`
//     + `{s:2:"id";s:${userId.toString().length}:"${userId}";`
//     + `s:8:"group_id";s:${groupId.toString().length}:"${groupId}";`
//     + `s:5:"group";s:${groupName.length}:"${groupName}";`
//     + `s:6:"active";s:1:"1";`
//     + `s:10:"created_at";s:19:"${sessionStart}";`
//     + `s:6:"expiry";s:19:"${sessionEnd}";`
//     + `s:7:"site_id";s:1:"2";`
//     + `s:17:"user_site_link_id";s:${userSiteLink ? userSiteLink.id.toString().length : 1}:"${userSiteLink ? userSiteLink.id : 0}";}`;
//   let session = await PhpSessions.create({
//     id: inputs.sessionId ? inputs.sessionId : sails.helpers.strings.random(),
//     session_user_id: userId,
//     session_start: (currentTime.getTime()/1000).toFixed(0),
//     session_time: (expiryTime.getTime()/1000).toFixed(0), //Creation + 1 year
//     session_data: sessionData
//   })
//     .fetch();
//   return session.id;
// }

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

