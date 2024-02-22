let Users = require('../repositories/users')
let UsersApi = require('../repositories/users.api')
let LessonFile = require('../repositories/lessonFiles')
let Lesson = require('../repositories/lessons')

let UserPhpSessionAWS = require('../repositories/users.phpsessionAWS')
let UserPhpSession = require('../repositories/users.phpsession')
let helpers = require('../helpers')
let axios = require('axios');
let LessonProgress = require('../repositories/lessonProgressAWS')
let moment = require('moment')

exports.getAccessTypeAndExpiry = async function(userId) {
    
    // console.log("fetching user access type");
      let szTeacherLinks = (await Users.getMysqlProduction(`Select * From sz_org_staff WHERE user_id=${userId} AND confirmed=1`))[0]

      if (szTeacherLinks && szTeacherLinks.length) {
        
        szTeacherLinks.org_id = (await Users.getMysqlProduction(`Select * From sz_organizations WHERE id=${szTeacherLinks.org_id}`))[0]
        const activeSchools = szTeacherLinks
          .map((i) => i && i.org_id)
          .filter((i) => i && i.status === 2)
        if (activeSchools && activeSchools.length) {
        //   sails.log.info(activeSchools[0])
          return { type: 'premium', expiry: activeSchools[0].expiry }
        }

      }
      // console.log(1)
      let szStudentLinks = (await Users.getMysqlProduction(`Select * From sz_students WHERE user_id=${userId} AND confirmed=1`))[0]
  
      if (szStudentLinks && szStudentLinks.length) {

        szStudentLinks.org_id = (await Users.getMysqlProduction(`Select * From sz_organizations WHERE id=${szTeacherLinks.org_id}`))[0]
        const activeSchools = szStudentLinks
          .map((i) => i && i.org_id)
          .filter((i) => i && i.status === 2)
        if (activeSchools && activeSchools.length) {
          return { type: 'premium', expiry: activeSchools[0].expiry }
        }
      }
      // console.log(2)
      // fetch users in mongo
      let userMongo = (await Users.findQuery({id:userId}))[0]

      let userAccess = (await Users.getMysqlProduction(`Select * From user_site_links WHERE user_id=${userId} ORDER BY expiry DESC LIMIT 1`))[0]

      // check user site links if site id != 2
      // if (userAccess.site_id != 2) {
      //   let userAccessSite2 = (await Users.getMysqlProduction(`Select * From user_site_links WHERE user_id=${userId} AND site_id=2`))[0]

      //   // force to use site id 2
      //   if (userAccessSite2) {
      //     userAccess = userAccessSite2
      //   }
      // }

      // console.log(3)
      // switch user access if mongo has latest expiry
      if (userMongo && userMongo.accessType) {
        if ( moment(userMongo.accessType.expiry).diff(userAccess.expiry) > 0 ) {
          console.log("used mongo records")
          userAccess = userMongo.accessType
          userAccess.usertype_id = helpers.accessMapreverse(userAccess.type)
        }
      }

      // console.log(">>>> CHECK USER EXPIRY ",userMongo.email, userAccess.expiry)

      if (userAccess && userAccess.usertype_id) {

        // CHECK EXPIRY DATE AND CHECK MONGO 
        // CHECKING OF MONGO STILL NEEDS CONFIRMATION

        if (moment().diff(userAccess.expiry) > 0) {
          // expired!
          // CHECK MONGO RECORDS HERE FOR ADDITIONAL CHECKING
          console.log("expired", userAccess.expiry);
          return {
            type: 'free',
            expiry: userAccess.expiry,
          }
        } else {
          console.log('f', userAccess.expiry, userAccess.usertype_id, helpers.accessMap(userAccess.usertype_id))
          return {
            type: helpers.accessMap(userAccess.usertype_id),
            expiry: userAccess.expiry,
          }
          
        }



        // return {
        //   type: helpers.accessMap(userAccess.usertype_id),
        //   expiry: userAccess.expiry,
        // }
      } else {
        return { type: 'free', expiry: new Date() }
      }

      
}

exports.getUser = async function(userId) {
    
    
  let user = (await Users.getMysqlProduction(`Select * From users WHERE id=${userId}`))[0]

  return user;

}

exports.migrateSession = async function() {
  console.log("migration called");

  //  =========== working function below commented out since in aws mongo return empty
  // let page = 0, limit = 100;
  // let total = await UserPhpSessionAWS.count()
  // console.log("total", total);
  // for (; page < Math.ceil(total/limit); page++) {
  //   console.log(` >>> FETCHING ${limit} RECORDS IN AWS ${(page+1)} of ${Math.ceil(total/limit)} <<< `);
  //   let usersSessions = await UserPhpSessionAWS.paginate(page*limit, limit)
  
  //   if (usersSessions) 
  //   for(let i=0; i < usersSessions.length; i++){
  //     let userSession = usersSession[i]
  //     console.log("adding session ID >> ", userSession.id);
  //     await UserPhpSession.upsert({id:userSession.id},userSession)
  //   }
  // }
  
}

exports.getRequestAPI = async function(req, res, next) {

  // console.log("method",req.headers)
  // console.log("method",req.params)
  try {
    let path = req.originalUrl ? req.originalUrl.replace("v2", "v1") : req.originalUrl;
    path = path.replace("proxy/","")
    // console.log(req.headers);
    let url = "https://www.chinesepod.com" + path

    // clean auth string
    let token = req.headers.authorization 
    if (token){
      token = token.replace("Bearer","").trim()
    } else {
      token = req.session.token
    }

    var options;

    if (path == "/api/v1/entrance/get-user") {
      options = {
        'method': req.method,
        'url': url,
        'headers': {
          'Cookie': req.headers.cookies,
          'Content-Type': 'text/plain; charset=utf-8',
        },
        'redirect': 'follow'
      };
    } else {
      options = {
        'method': req.method,
        'url': url,
        'headers': {
          'Authorization': 'Bearer ' + token,
          'Cookie': req.headers.cookies,
          'Content-Type': 'text/plain; charset=utf-8',
        },
        'body': JSON.stringify(req.body) 
      };
    }

    // console.log("options",options);


    // CHECK REQUEST TYPE

    let data = await axios(options)
    // switch(req.method) {
    //   case 'POST': 
    //     data = await axios.post(url,options)
    //   break;
    //   case 'PUT': 
    //   data = await axios.put(url,options)
    //   break;
    //   case 'PATCH': 
    //   data = await axios.patch(url,options)
    //   break;
    //   case 'DELETE': 
    //   data = await axios.delete(url,options)
    //   break;
    //   default: 
    //     data = await axios.get(url,options)
    //   break;
    // }
    
    return data

  } catch (err) {
    console.log("API ERROR")
    return err.response
  }
  
}

exports.recordServe = async function(req, response) {

  let path = req.originalUrl.replace("v2", "v1")

  let modelObj = helpers.getCollectionFromUrl(path)
  
  console.log("check path and return corresponding collection name", modelObj)
  if (modelObj && modelObj.action)  
  switch(modelObj.action){
    case 'history' : 
    case 'bookmarks' : 
    case 'courses' : 
    case 'stats' : 
    case 'info' : 
      // update user fetch userId from session token
      let data = {
        userId: req.session.userId
      }
      data[modelObj.action] = response.data
      Users.upsert({userId: req.session.userId}, data)
    break
  }
}


// test
exports.udpateLessonFiles = async function() {
  let lessons = await Lesson.getMysqlProduction(`
                SELECT v3_id as id, video
                FROM contents 
                WHERE video <> ''
              `)

  console.log(lessons.length);

  // 6hmajyyou7.mp4
  // let source = await LessonFile.findDynamoDB('srcVideo', 'eid339jkty.mp4', 1)
  // console.log(source);

  // return;
  for (let i=0; i < lessons.length; i++) {
    let lesson = lessons[i]

    let source = (await LessonFile.findDynamoDB('srcVideo', lesson.video + '.mp4'))[0]

    // source.id = lesson.id

    let sourceData = {
      id: lesson.id,
      videoId: lesson.video,
      srcVideo: source ? source.srcVideo : ''
    }

    // if (!source)
    // sourceData.srcVideo = "https://d3glhinmyc42ep.cloudfront.net/2cc1a95f-a5b3-4642-b9e6-73823d3b7e9c/hls/"+lesson.video+".m3u8"

    LessonFile.upsert({id: sourceData.id}, sourceData)
    console.log(lesson.video,source)
  }

  console.log("-end-")

}

exports.findAWSFile = async function(key) {
  let data = await LessonFile.findAWSFile(key);
}

exports.cleanupRecords = function(obj) {
  
}

exports.getUserStats = async function(userId) {

  let returnData = {}

  let userData = (await Users.getMysqlProduction(`Select * From users WHERE id=${userId}`))[0]
// console.log(1)
  if (!userData) res.json({})

  let userOptions = await Users.getMysqlProduction(`Select * From user_options 
                                                        WHERE user_id=${userId} 
                                                        AND option_key IN ( 
                                                                'level',
                                                                'charSet',
                                                                'interests',
                                                                'autoMarkStudied',
                                                                'pinyin',
                                                                'newDash',
                                                                'timezone',
                                                                'currentLesson',
                                                                'weeklyGoal'
                                                    )`);

  userOptions = helpers.toObject(userOptions)

  let charSet = userOptions['charSet']
      ? userOptions['charSet']
      : 'simplified'
  let level = userOptions['level']
      ? helpers.intToLevel(userOptions['level'])
      : 'newbie'
      // console.log(2)
  //CONVERT SOME OPTIONS TO Boolean
  userOptions['pinyin'] = userOptions['pinyin'] === 'true'
  userOptions['autoMarkStudied'] = !(
      userOptions['autoMarkStudied'] === 'false'
  )
  userOptions['newDash'] = !(userOptions['newDash'] === 'false')

  const targets = {
    newbie: 50,
    elementary: 80,
    preInt: 100,
    intermediate: 120,
    upperInt: 160,
    advanced: 120,
    media: 80,
  }

  const levelMap = {
    'upper intermediate': 'upperInt',
    'pre intermediate': 'preInt',
  }

  // console.log(3)

  if (userOptions && userOptions.option_value) {
    level = helpers.intToLevel(userOptions.option_value)
  } else {
    returnData.levelUnset = true
  }
  // console.log(3.1)
  let userPreferences = (await Users.getMysqlProduction(`Select * From user_preferences WHERE user_id=${userId} ORDER BY updated_at DESC`))[0]

  // console.log(3.2)
  let userLessons = await Users.getMysqlProduction(`Select v3_id, saved, studied, created_at as updatedAt From user_contents 
                                                        WHERE user_id=${userId} 
                                                        AND studied=1
                                                        AND lesson_type=0
                                                        ORDER BY created_at DESC
                                                    `);
  // console.log(3.3, userLessons.length)
  // POPULATE lesson
  for (let i=0; i < userLessons.length; i++) {
    userLessons[i].lesson = (await Users.getMysqlProduction(`Select updated_at as updatedAt, level From contents 
        WHERE v3_id='${userLessons[i].v3_id}' 
    `))[0];
  }
  // console.log(4)
  let progressData = userLessons.filter(function (item) {
    // console.log(item)
    if (!item.lesson || !item.lesson.level) return false
    return levelMap[item.lesson.level.toLowerCase()]
      ? levelMap[item.lesson.level.toLowerCase()] === level
      : item.lesson.level.toLowerCase() === level
  })

  let thisMonth = userLessons.filter(function (item) {
    if (!item || !item.updatedAt) return false
    return (
      item.updatedAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) &&
      item.updatedAt < new Date()
    )
  })

  let lastMonth = userLessons.filter(function (item) {
    if (!item || !item.updatedAt) return false
    return (
      item.updatedAt > new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000) &&
      item.updatedAt < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    )
  })

  let thisWeek = userLessons.filter(function (item) {
    if (!item || !item.updatedAt) return false
    return (
      item.updatedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) &&
      item.updatedAt < new Date()
    )
  })

  let lastWeek = userLessons.filter(function (item) {
    if (!item || !item.updatedAt) return false
    return (
      item.updatedAt > new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000) &&
      item.updatedAt < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    )
  })
  // console.log(5)
  let accessInfo = await this.getAccessTypeAndExpiry(userId)
  // console.log(accessInfo);
  delete userData.admin_note
  delete userData.age_id
  delete userData.birthday
  delete userData.ltsm
  delete userData.ltv
  delete userData.mailing_address1
  delete userData.mailing_address2
  delete userData.mailing_city
  delete userData.mailing_country
  delete userData.mailing_postal_code
  delete userData.mailing_state
  delete userData.msn

  // console.log(6)

  let retData = {
    ...returnData,
    ...userData,
    ...{
      userId: userId,
      name: userData.name,
      username: userData.username,
      avatar: userPreferences
        ? userPreferences['avatar_url']
        : 'https://www.chinesepod.com/dash/img/brand/symbol-black-center.svg',
      lastLogin: userPreferences ? userPreferences['lastSeenAt'] : '',
      goals: {
        thisWeek: thisWeek.length,
        lastWeek: lastWeek.length,
        thisMonth: thisMonth.length,
        lastMonth: lastMonth.length,
      },
      progress: {
        current: progressData.length,
        target: targets[level],
      },
      level: level,
      charSet:
        charSet && charSet['option_value']
          ? charSet['option_value']
          : 'simplified',
      pinyin: false,
      access: accessInfo.type,
    },
    ...userOptions,
    accessType: accessInfo
  }

  // retData.avatar = retData.userAvatar
  retData.mobilePhone = retData.mobile_phone
  retData.creditAmount = retData.credit_amount
  retData.confirmStatus = retData.confirm_status
  retData.purchaseStatus = retData.purchase_status
  retData.roleId = retData.role_id
  retData.schoolId = retData.school_id
  retData.createdAt = retData.created_at
  retData.updatedAt = retData.updated_at

  delete retData.userId
  delete retData.ip_address
  delete retData.avatar_url
  delete retData.interests
  delete retData.http_referer
  delete retData.source_type
  delete retData.skyper
  delete retData.created_by
  delete retData.updated_by
  delete retData.ip_country
  delete retData.ip_region
  delete retData.ip_city
  delete retData.signin_source
  delete retData.member_id
  delete retData.userAvatar
  delete retData.mobile_phone
  delete retData.credit_amount
  delete retData.confirm_status
  delete retData.purchase_status
  delete retData.role_id
  delete retData.school_id
  delete retData.created_at
  delete retData.updated_at
  delete retData.come
  

  


  // Fetch lesson progress
  let subscriptions = await Users.getUserSubscriptions(retData.id)
  let emailLogs = await Users.getUserEmailLogs(retData.id)
  let dictionaries = await Users.getUsersDictionaries(retData.id)
  let vocabularies = await Users.getUserVocabulary(retData.id)
  let courses = await Users.getUserCourse(retData.id)

  // console.log(emailLogs);
  if (emailLogs && emailLogs.length > 0) retData.emailLogs = emailLogs
  if (subscriptions && subscriptions.length > 0) retData.subscriptions = subscriptions
  if (dictionaries && dictionaries.length > 0) retData.dictionaries = dictionaries
  if (vocabularies && vocabularies.length > 0) retData.vocabularies = vocabularies
  if (courses && courses.length > 0) retData.courses = courses

  // console.log(courses);
  // SAVE IN MONGO
  // userData.stats = retData
  // Users.upsert({id:userData.id},userData);
  // console.log("Store user ", retData);
  let removeFields = {
    mailingAddress1: '',
    mailingAddress2: '',
    mailingCity: '',
    mailingPostalCode: '',
    mailingCountry: '',
    mailingState: '',
    mailingState: '',
    studiedLessons: '',
    mail: '',
    ltsm: '',
    ltv: '',
    avatar_url: '',
    http_referer: '',
    ip_address: '',
    ip_city: '',
    ip_country: '',
    ip_region: '',
    mobile_phone: '',
    credit_amount: '',
    confirm_status: '',
    purchase_status: '',
    role_id: '',
    school_id: '',
    signin_source: '',
    source_type: '',
    created_at: '',
    updated_at: '',
    come: '',
    createdBy: '',
    updatedBy: '',
    avatarUrl: '',
    member_id: '',
    updated_by: '',
    created_by: '',
    userAvatar: '',
  }

  // get users in mongo check user access object
  // accessInfo
  // let userMongo = (await Users.findQuery({id: retData.id}))[0]

  // if (userMongo && userMongo.accessType){
  //   if ( moment(accessInfo.expiry).diff(userMongo.accessType.expiry) > 0 ) {
  //     retData.accessType = {
  //       type: helpers.accessMap(accessInfo.usertype_id),
  //       expiry: accessInfo.expiry
  //     }
  //   }
  // } else {
  //   // add accesstype object in mongo records
  //   retData.accessType = {
  //     type: helpers.accessMap(accessInfo.usertype_id),
  //     expiry: accessInfo.expiry
  //   }
  // }

  // console.log(retData);

  Users.removeFields(retData.id,removeFields)
  if (retData && retData.email)
  Users.upsert({id:retData.id}, retData)

  console.log('saved',retData.id);
  // res.json(retData);
}