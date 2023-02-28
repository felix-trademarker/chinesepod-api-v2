let userService = require('../services/userService')
let Users = require('../repositories/users')
let Subscriptions = require('../repositories/subscriptions')
let _ = require('lodash')
let axios = require('axios');
// const cookie = require('cookie');
// var cookieParser = require('cookie-parser');

exports.getUser = async function(req, res, next) {

  let response = await userService.getRequestAPI(req, res, next)
  // console.log("this", response.data);
  if (response.status == 404){
    res.json(response.statusText)
  }
  else{
    // TODO CREATE DYNAMIC FUNCTION TO DETERMINE EACH PATH AND SAVE TO CORRESPONDING COLLECTION

    // SEND API RESPONSE
    res.json(response.data)
  }

  // THIS IS TO DECRYPT TOKEN
  // COMMENT OUT BELOW FOR TEST ONLY
  // let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJJZCI6MTE5NzIzMSwiaXNUZWFtIjpmYWxzZX0sImlhdCI6MTY3MzM0NjQ0NywiZXhwIjoxNjczNDMyODQ3fQ.j_HA4pcVw908D93n6kxC36nwi4PU0e_tPeeNn68RVgQ"
  // var jsonPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())

  // FETCH COOKIES AND INCLUDE IN HEADERS REQUEST
  // var options = {
  //   'headers': {
  //     'Cookie': req.headers.cookie
  //   }
  // };
  // let url = 'https://www.chinesepod.com/api/v1/entrance/get-user'

  // let currentUser = await axios.get(url,options)

  // res.json(currentUser.data);

}

exports.getInfo = async function(req, res, next) {
    
  let userId = req.session.userId

  if (req.params.userId) userId = req.params.userId 

  if(userId) {
    let returnData = {}

    let userData = (await Users.getMysqlProduction(`Select * From users WHERE id=${userId}`))[0]

    if (!userData) {
        throw 'invalid'
    }

    try {

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

        userOptions = res.app.locals.helpers.toObject(userOptions)

        let charSet = userOptions['charSet']
            ? userOptions['charSet']
            : 'simplified'
        let level = userOptions['level']
            ? res.app.locals.helpers.intToLevel(userOptions['level'])
            : 'newbie'

      //CONVERT SOME OPTIONS TO Boolean
        userOptions['pinyin'] = userOptions['pinyin'] === 'true'
        userOptions['autoMarkStudied'] = !(
            userOptions['autoMarkStudied'] === 'false'
        )
        userOptions['newDash'] = !(userOptions['newDash'] === 'false')

        let userPreferences = (await Users.getMysqlProduction(`Select * From user_preferences WHERE user_id=${userId} ORDER BY updated_at DESC`))[0]

        let accessInfo = await userService.getAccessTypeAndExpiry(userId)

        let access = accessInfo.type

        let trial = userData.trial

        // console.log(access, res.app.locals)

      if (!['premium', 'admin', 'basic'].includes(access)) { 
        const currentDate = new Date()

        if (req.location) {
          try {
            const geoip = require('geoip-country')
            const geo = geoip.lookup(this.req.ip)
            req.location = geo ? geo['country'] : false
          } catch (e) {}
        }

        if (userData.email.split('@')[1] === 'chinesepod.com') {
          // if (false) {

          access = 'premium'
        } else if (
            req.location &&
            res.app.locals.variables.coreMarkets.includes(req.location) &&
            res.app.locals.variables.coreFreeMonths.includes(currentDate.getMonth())
        ) {
          access = 'premium'
        } else if (
            req.location &&
          !res.app.locals.variables.coreMarkets.includes(req.location) &&
          res.app.locals.variables.nonCoreFreeMonths.includes(currentDate.getMonth())
        ) {
          access = 'premium'
        } else {
          returnData.upgrade = {
            needsUpgrade: false,
            allowedCount: 10,
            // lessonCount: lessonCount,
            // lessonTimeline: lessonTimeline,
            canDismiss: true,
            upgradePath: 2, // 3 , 2 , 1,
            prerollAdId: res.app.locals.variables.prerollAdId,
            prerollAds: res.app.locals.variables.prerollAds,
            upgradeLink:
            res.app.locals.variables.upgradeLink + (trial ? '' : '?trial=yes'),
          }
          // trial = new Date(); //OVERRIDE TRIAL DATE TO FORCE ONLY PREMIUM OPTIONS IN DAS
        }
      } else if (access === 'basic') {
        returnData.upgrade = {
          needsUpgrade: false,
          canDismiss: true,
          upgradePath: 2, // 3 , 2 , 1
        }
      }

      let newLastLogin = 0
      let oldLastLogin = 0

      if (userData.admin_note && Number.isInteger(userData.admin_note)) {
        newLastLogin = new Date(userData.admin_note)
      }

      if (userPreferences && userPreferences['last_login_ip']) {
        oldLastLogin = new Date(userPreferences['last_login_ip'])
      }

      let lastLogin = newLastLogin > oldLastLogin ? newLastLogin : oldLastLogin

      let szStudentLinks = await Users.getMysqlProduction(`Select * From sz_students WHERE user_id=${userId} AND confirmed=0`)
      if (szStudentLinks && szStudentLinks.length) {
        returnData.szStudentLinks = szStudentLinks.map((i) =>
          _.pick(i, ['id', 'createdAt'])
        )
      }

      let szTeacherLinks = await Users.getMysqlProduction(`Select * From sz_org_staff WHERE user_id=${userId} AND confirmed=0`)
      if (szTeacherLinks && szTeacherLinks.length) {
        returnData.szTeacherLinks = szTeacherLinks.map((i) =>
          _.pick(i, ['id', 'createdAt'])
        )
      }
      const isTeam = (await Users.getMysql2015(`Select * From Users WHERE email='${userData.email}' AND status=1`))[0]
    //   const isTeam = await CRMUsers.findOne({
    //     email: userData.email,
    //     status: 1,
    //   })

    //   if (isTeam) {
    //     await CRMUsersMongo.updateOrCreate({ id: isTeam.id }, { ...isTeam })
    //   }

      let contents = {
        ...returnData,
        ...userOptions,
        ...{
          isTeam: !!isTeam,
          userId: userId,
          name: userData.name,
          email: userData.email,
          username: userData.username,
          confirmed: userData.confirm_status,
          createdAt: userData.createdAt,
          trial: trial,
          userAvatar: userPreferences
            ? userPreferences['avatar_url']
            : 'https://www.chinesepod.com/dash/img/brand/symbol-black-center.svg',
          lastLogin: lastLogin,
          location: req.location,
          level: level,
          charSet: charSet,
          access: access,
          expiry: accessInfo.expiry,
        },
      }
      res.json(contents);
    } catch (e) {
      console.log(e);
    }
  } else {
    res.json({})
  }

  
} 

exports.getStats = async function(req, res, next) {

  let response = await userService.getRequestAPI(req, res, next)

  res.json(response.data)
}

exports.getSubscriptions = async function(req, res, next) {
  let userId = req.session.userId

  // console.log(req.cookies)
  // let cpodSid = req.cookies['cpod.sid']
  // console.log(cpodSid);
  // if (req.params.userId) {
  //   userId = req.params.userId
  // } else if (req.headers && req.headers.authorization) {
  //   let userDataToken = res.app.locals.helpers.extractToken(req)
  //   userId = userDataToken.userId
  // }

  console.log(userId);

  // console.log(req.headers)

  if (userId) {

    let subscriptions = await Subscriptions.getMysqlProduction(`
      SELECT
        id,
        user_id as userId,
        subscription_id as subscriptionId,
        subscription_from as subscriptionFrom, 
        subscription_type as subscriptionType, 
        is_old as isOld, 
        product_id as productId, 
        product_length as productLength, 
        status as status, 
        receipt as receipt, 
        date_cancelled as dateCancelled, 
        date_created as dateCreated, 
        next_billing_time as nextBillingTime, 
        last_modified as lastModified, 
        cc_num as ccNum, 
        cc_exp as ccExp, 
        paypal_email as paypalEmail 
      FROM subscriptions 
      WHERE user_id=${userId} and next_billing_time > '${res.app.locals.moment().format()}'
    `);

    console.log(subscriptions);

    let userSubs = []

    if(subscriptions)
    for (let i=0; i < subscriptions.length; i++) {
      let subscription = subscriptions[i]

      let product = (await Subscriptions.getMysql2015(`
        SELECT 
        currency, list_price as listPrice, current_price as currentPrice, product_title as productTitle, description
        FROM Products
        WHERE product_id=${subscription.productId}
      `))[0]
      console.log(product)
      subscription.product = product

      userSubs.push(subscription)
    }
    
    res.json(userSubs);
  } else {
    res.json({});

  }

  // next()
}

exports.popularRecapLessons = async function(req, res, next) {

  console.log('test etstsetset >>>>>>>>>> ');
  const groupBy = key => array =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key];
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});

  let period = 30;
  // period = inputs.days <= 30 ? inputs.days : 30;
  // if (inputs.days) {
  //   period = inputs.days <= 30 ? inputs.days : 30;
  // }

  var AwsS3 = require ('aws-sdk/clients/s3');
  const s3 = new AwsS3 ({
    accessKeyId: process.env.awsKey,
    secretAccessKey: process.env.awsSecret,
    region: 'us-east-1',
  });

  const listDirectories = params => {
    return new Promise ((resolve, reject) => {
      const s3params = {
        Bucket: 'chinesepod-recap',
        MaxKeys: 1000,
        Delimiter: '/',
      };
      s3.listObjectsV2 (s3params, (err, data) => {
        if (err) {
          reject (err);
        }
        resolve (data);
      });
    });
  };

  let recapList = [];

  await listDirectories()
    .then((response) => {
      response['CommonPrefixes'].forEach((item,i) => {
        recapList[i] = item['Prefix'].split('/')[0];
      });
    });

  let relevantLogs = [];

  let baseUrls = ['https://www.chinesepod.com/api/v1/lessons/get-dialogue?lessonId=', ];

  recapList.forEach((lesson) => {
    baseUrls.forEach((url) => relevantLogs.push(url + lesson))
  });

  // let newLogs = await Logging.find({
  //   where: {
  //     id: {
  //       '!=': 'NONE'
  //     },
  //     accesslog_url: {
  //       in: relevantLogs
  //     },
  //     createdAt: {
  //       '>': new Date(Date.now() - period * 24 * 60 * 60 * 1000)
  //     }
  //   },
  //   select: ['id', 'accesslog_url']
  // });

  console.log(relevantLogs);

  let newLogs = await Users.getMysqlLogging(`Select accesslog_user as id,accesslog_url From cp_accesslog 
                                              WHERE accesslog_url IN ( "https://www.chinesepod.com/api/v1/lessons/get-dialogue?lessonId=0001","https://www.chinesepod.com/api/v1/lessons/get-dialogue?lessonId=0002" ) 
                                              AND accesslog_user <> 'NONE'
                                              AND accesslog_time > '${res.app.locals.moment().subtract(period,'days')}'
                                              `);

  newLogs.forEach((log) => log.lessonId = log.accesslog_url.split('lessonId=')[1]);

  // let oldLogs = await Logging.find({
  //   where: {
  //     id: {
  //       '!=': 'NONE'
  //     },
  //     accesslog_urlbase: {
  //       'in': [
  //         'https://chinesepod.com/lessons/api',
  //         'https://ws.chinesepod.com:444/1.0.0/instances/prod/lessons/get-lesson-detail',
  //         'https://server4.chinesepod.com:444/1.0.0/instances/prod/lessons/get-dialogue'
  //       ]
  //     },
  //     createdAt: {
  //       '>': new Date(Date.now() - period * 24 * 60 * 60 * 1000)
  //     }
  //   },
  //   select: ['id', 'accesslog_url']
  // });

  let oldLogs = await Users.getMysqlLogging(`Select accesslog_user as id,accesslog_url From cp_accesslog 
                                              WHERE accesslog_url IN ( 'https://chinesepod.com/lessons/api',
                                              'https://ws.chinesepod.com:444/1.0.0/instances/prod/lessons/get-lesson-detail',
                                              'https://server4.chinesepod.com:444/1.0.0/instances/prod/lessons/get-dialogue' ) 
                                              AND accesslog_user <> 'NONE'
                                              AND accesslog_time > ${res.app.locals.moment().subtract(period,'days')}
                                              `);

  oldLogs.forEach((log) => log.lessonId = log.accesslog_url.split('v3_id=')[1].split('&')[0]);

  let allLogs = [...newLogs, ...oldLogs];

  const groupByLessonId = groupBy('lessonId');

  let groupedLogs = groupByLessonId(allLogs);

  let returnList = [];

  Object.keys(groupedLogs).map((i) => {
    let users = [];
    groupedLogs[i].forEach((log) => users.push(log.id));
    returnList.push({
      lessonId: i,
      users: users,
      views: users.length
    })
  });

  // return returnList.sort((a, b) => b.views - a.views)
  res.json(returnList.sort((a, b) => b.views - a.views))
}

// DYNAMIC FUNCTION
exports.serveAPI = async function(req, res, next) {

  // console.log("serve",req.headers)
  let response = await userService.getRequestAPI(req, res, next)
  console.log(response)
  // return response;
  if (response && response.status == 404){
    res.json(response.statusText)
  }
  else{
    // TODO CREATE DYNAMIC FUNCTION TO DETERMINE EACH PATH AND SAVE TO CORRESPONDING COLLECTION
    userService.recordServe(req, response)
    // SEND API RESPONSE
    // console.log(response)
    res.json(response.data)
  }

}
  