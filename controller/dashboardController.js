let userService = require('../services/userService')
let Users = require('../repositories/users')
let Lessons = require('../repositories/lessons')
let Course = require('../repositories/courses')
let crmUsersMongoAws = require('../repositories/crmUsersMongoAWS')
let Subscriptions = require('../repositories/subscriptions')
let _ = require('lodash')
const sanitizeHtml = require('sanitize-html')
// let axios = require('axios');
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

  // if (!userId) {
  //   throw 'invalid'
  // }
  // userId= "1210621"
  if(userId) {
    let returnData = {}

    // save userData in mongo158
    userService.getUserStats(userId)

    let userData = (await Users.getMysqlProduction(`Select * From users WHERE id=${userId}`))[0]

    if (!userData) res.json({})

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
          // console.log("generated access =========== >>>>>",accessInfo, userId);
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

      // if (userId == 1197231) {
      //   trial = true
      //   returnData.upgrade = {
      //     needsUpgrade: false,
      //     allowedCount: 10,
      //     // lessonCount: lessonCount,
      //     // lessonTimeline: lessonTimeline,
      //     canDismiss: true,
      //     upgradePath: 2, // 3 , 2 , 1,
      //     prerollAdId: res.app.locals.variables.prerollAdId,
      //     prerollAds: res.app.locals.variables.prerollAds,
      //     upgradeLink:
      //     res.app.locals.variables.upgradeLink + (trial ? '' : '?trial=yes'),
      //   }
      //   access = 'basic'
      // }

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

      if (isTeam) {
        await crmUsersMongoAws.upsert({ id: isTeam.id }, { ...isTeam })
      }

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

      // SAVE IN MONGO
      // userData.info = contents
      // // cleanup records
      // delete userData.admin_note
      // delete userData.age_id
      // delete userData.birthday
      // delete userData.ltsm
      // delete userData.ltv
      // delete userData.mailing_address1
      // delete userData.mailing_address2
      // delete userData.mailing_city
      // delete userData.mailing_country
      // delete userData.mailing_postal_code
      // delete userData.mailing_state
      // delete userData.msn



      // Users.upsert({id:userData.id},userData);
      console.log("API USER GET INFO");


      // console.log("contents", userData);
      res.json(contents);
    } catch (e) {
      console.log(e);
    }
  } else {
    res.json({})
  }

  
} 

exports.getStats = async function(req, res, next) {

  let userId = req.session.userId

  if (req.params.userId) userId = req.params.userId 

  // userId= "1210621"
  let returnData = {}

  let userData = (await Users.getMysqlProduction(`Select * From users WHERE id=${userId}`))[0]

  if (!userData) res.json({})

  userService.getUserStats(userId)

  let userOptions = (await Users.getMysqlProduction(`Select * From user_options 
                                                        WHERE user_id=${userId} 
                                                        AND option_key='level'
                                                        LIMIT 1`))[0];

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

  let level = 'newbie'

  if (userOptions && userOptions.option_value) {
    level = res.app.locals.helpers.intToLevel(userOptions.option_value)
  } else {
    returnData.levelUnset = true
  }

  let charSet = (await Users.getMysqlProduction(`Select * From user_options 
                                                        WHERE user_id=${userId} 
                                                        AND option_key='charSet'
                                                        LIMIT 1
                                                    `))[0];

  // let userPreferences = await UserPreferences.findOne(inputs.userId)

  let userPreferences = (await Users.getMysqlProduction(`Select * From user_preferences WHERE user_id=${userId} ORDER BY updated_at DESC`))[0]
  // console.log(userPreferences);
  // let userLessons = await UserContents.find({
  //   where: {
  //     user_id: inputs.userId,
  //     studied: 1,
  //     lesson_type: 0,
  //   },
  //   select: ['lesson', 'saved', 'studied', 'updatedAt'], //  'title', 'slug', 'image', 'hash_code', 'publication_timestamp'
  //   sort: 'updatedAt DESC',
  // }).populate('lesson')

  let userLessons = await Users.getMysqlProduction(`Select v3_id, saved, studied, created_at as updatedAt From user_contents 
                                                        WHERE user_id=${userId} 
                                                        AND studied=1
                                                        AND lesson_type=0
                                                        ORDER BY created_at DESC
                                                    `);
  // POPULATE lesson
  for (let i=0; i < userLessons.length; i++) {
    userLessons[i].lesson = (await Users.getMysqlProduction(`Select * From contents 
        WHERE v3_id='${userLessons[i].v3_id}' 
    `))[0];
  }

  let progressData = userLessons.filter(function (item) {
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

  let accessInfo = await userService.getAccessTypeAndExpiry(userId)

  let retData = {
    ...returnData,
    ...{
      userId: userId,
      name: userData.name,
      username: userData.username,
      userAvatar: userPreferences
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
  }

  // SAVE IN MONGO
  // userData.stats = retData
  // Users.upsert({id:userData.id},userData);
  console.log("API USER GET STATS");

  res.json(retData);
}

exports.getSubscriptions = async function(req, res, next) {
  let userId = req.session.userId

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

    // console.log(subscriptions);

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
      // console.log(product)
      subscription.product = product

      userSubs.push(subscription)
    }

    let user = await userService.getUser(userId)

    if (user && user.email)
    Users.upsert({id:userId},{ subscriptions: userSubs });
    
    res.json(userSubs);
  } else {
    res.json({});

  }

  // next()
}

exports.getUserSubscription = async function(req, res, next) {
  
  if (!req.query || !req.query.email) {
    res.json({})
  }


  let user = (await Users.getUserByEmailSQL(req.query.email))[0]
  let userId = user.id;
  console.log(userId);
  if (!user) {
    res.json({});
  } else { 

    let sqlQuery = `
      SELECT
        id,
        user_id as userId,
        subscription_id as subscriptionId,
        subscription_from as subscriptionFrom, 
        subscription_type as subscriptionType, 
        product_id as productId, 
        status as status, 
        receipt as receipt, 
        date_cancelled as dateCancelled, 
        date_created as dateCreated, 
        next_billing_time as nextBillingTime, 
        last_modified as lastModified
      FROM subscriptions 
      WHERE user_id=${userId} and next_billing_time > '${res.app.locals.moment().format()}'
      `

    let subscriptions = await Subscriptions.getMysqlProduction(sqlQuery);

    // console.log(subscriptions);

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
      // console.log(product)
      
      subscription.paymentMethod = res.app.locals.helpers.paymentMap(subscription.subscriptionFrom)
      // subscription.subscriptionFrom = res.app.locals.helpers.paymentMap(subscription.subscriptionFrom)
      subscription.subscriptionType = res.app.locals.helpers.subscriptionTypeMap(subscription.subscriptionType)
      subscription.status = res.app.locals.helpers.subscriptionStatusMap(subscription.status)

      delete subscription.productId
      delete subscription.subscriptionFrom

      subscription.product = product

      userSubs.push(subscription)
    }

    // let user = await userService.getUser(userId)

    // if (user && user.email)
    // Users.upsert({id:user.id},{ subscriptions: userSubs });

    let access = await userService.getAccessTypeAndExpiry(userId)

    // let retData {
    //   ...access
    //   subscriptions: userSubs
    // }
    access.subscriptions = userSubs
    // console.log(access)
    res.json(access);
  }

  // next()
}

exports.courseLessons = async function(req, res, next) {
    
  let userId = req.session.userId

  if (req.params.userId) userId = req.params.userId 

  if (req.query.userId) userId = req.query.userId 

  let courseId = req.query.courseId;
  let exclude = req.query.exclude;
  let limit = req.query.limit;
  let all = req.query.all;



  if (!userId || !courseId) {
    res.json({err:'Invalid'})
  } else {
    console.log(" == courses == ");
    if(userId && courseId) {
      
      // FETCH USER CONTENTS
      let columns = res.app.locals.helpers.getLessonColumns()
      let courseData = await Users.getMysqlProduction(`
        SELECT ${columns.join(',')}  
        FROM course_contents AS cc
        LEFT JOIN contents AS c
        ON cc.v3_id = c.v3_id
        WHERE cc.course_id=${courseId}
        ORDER BY displaysort ASC
      `);

      let returnData = []

      for (let i=0; i < courseData.length; i++) {
        let lesson = courseData[i]

        lesson.userContents = await Users.getMysqlProduction(`
        SELECT saved, studied FROM user_contents WHERE user_id=${userId} AND lesson_type=0 AND v3_id='${lesson.id}'
        `)

        if (lesson.userContents[0]) {
          lesson.saved = lesson.userContents[0].saved
          lesson.studied = lesson.userContents[0].studied
          delete lesson.userContents
          returnData.push(lesson)
        } else {
          lesson.saved = 0
          lesson.studied = 0
          returnData.push(lesson)
        }
      }

      if (all) {
        res.json(returnData)
      } else {

        let user = await userService.getUser(userId)

        if (user && user.email)
        Users.upsert({id:userId},{ courses: returnData });

        res.json(returnData
          .filter((lesson) => {
            return (
              lesson.studied !== 1 &&
              (exclude ? !exclude.includes(lesson.id) : true)
            )
          })
          .slice(0, limit))
      }

      
    } else {
      res.json({})
    }
  }
  
} 

exports.userCourses = async function(req, res, next) {
    
  let userId = req.session.userId

  if (req.params.userId) userId = req.params.userId 

  if (req.query.userId) userId = req.query.userId 

  if (!userId) {
    res.json({err:'Invalid'})
  } else {

    let userCourses = await Users.getMysqlProduction(`
          SELECT default_status, course_id, user_course_id as id
          FROM user_courses 
          WHERE user_id=${userId}
          ORDER BY last_modified DESC
        `)

    let returnedData = []
    for(let i=0; i < userCourses.length; i++) {
      let courseData = userCourses[i]
      let course = (await Users.getMysqlProduction(`
          SELECT channel_id, course_image, course_introduction, course_title, hash_code, course_id as id 
          FROM course_detail 
          WHERE course_id=${courseData.course_id}
        `))[0]

      courseData.course = course

      returnedData.push(courseData)
    }

    let user = await userService.getUser(userId)

    if (user && user.email)
    Users.upsert({id:userId},{ courses: returnedData });

    res.json(returnedData);
  }
  
} 

exports.history = async function(req, res, next) {
    
  let userId = req.session.userId
  let limit = req.query.limit

  if (!userId) {
    res.json({err:'Invalid'})
  } else {

    let userLessons = await Users.getMysqlProduction(`
      SELECT saved, studied, v3_id, created_at as updatedAt
      FROM user_contents 
      WHERE user_id=${userId} AND lesson_type=0 AND studied=1
      ORDER BY created_at DESC
      LIMIT ${limit? limit : 10}
    `)
    let columns = res.app.locals.helpers.getLessonColumns()
    columns[0] = "v3_id as id"

    let retArr = []
    for (let i=0; i < userLessons.length; i++) {
      let userLesson = userLessons[i]
      let lesson = (await Users.getMysqlProduction(`
        SELECT ${columns.join(',')}  
        FROM contents
        WHERE v3_id='${userLesson.v3_id}'
      `))[0];

      lesson.saved = userLesson.saved
      lesson.studied = userLesson.studied
      retArr.push(lesson)
    }

    let user = await userService.getUser(userId)

    if (user && user.email)
    Users.upsert({id:userId},{ history: retArr });

    res.json(retArr)

  }
  
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

  console.log(relevantLogs);

  let newLogs = await Users.getMysqlLogging(`Select accesslog_user as id,accesslog_url From cp_accesslog 
                                              WHERE accesslog_url IN ( "https://www.chinesepod.com/api/v1/lessons/get-dialogue?lessonId=0001","https://www.chinesepod.com/api/v1/lessons/get-dialogue?lessonId=0002" ) 
                                              AND accesslog_user <> 'NONE'
                                              AND accesslog_time > '${res.app.locals.moment().subtract(period,'days')}'
                                              `);

  newLogs.forEach((log) => log.lessonId = log.accesslog_url.split('lessonId=')[1]);

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

  res.json(returnList.sort((a, b) => b.views - a.views))
}

exports.bookmarks = async function(req, res, next) {

  let userId = req.session.userId
  let limit = req.query.limit

  if (!userId) {
    res.json({err:'Invalid'})
  } else {

    let userLessons = await Users.getMysqlProduction(`
      SELECT saved, studied, v3_id, created_at as updatedAt
      FROM user_contents 
      WHERE user_id=${userId} AND lesson_type=0 AND saved=1
      ORDER BY created_at DESC
      LIMIT ${limit? limit : 10}
    `)
    let columns = res.app.locals.helpers.getLessonColumns()
    columns[0] = "v3_id as id"

    let retArr = []
    for (let i=0; i < userLessons.length; i++) {
      let userLesson = userLessons[i]
      let lesson = (await Users.getMysqlProduction(`
        SELECT ${columns.join(',')}  
        FROM contents
        WHERE v3_id='${userLesson.v3_id}'
      `))[0];

      // lesson.saved = userLesson.saved
      // lesson.studied = userLesson.studied
      retArr.push(lesson)
      Lessons.upsert({id:lesson.id},lesson)
    }

    let user = await userService.getUser(userId)

    if (user && user.email)
    Users.upsert({id:userId},{ bookmarks: retArr });

    res.json(retArr)

  }



}

exports.moreCourses = async function(req, res, next) {

  let userId = req.session.userId

  if (!userId) {
    res.json({err:'Invalid'})
  } else {

    let userOptions = (await Users.getMysqlProduction(`Select option_value From user_options 
                                                        WHERE user_id=${userId} 
                                                        AND option_key='level'`))[0];

    let levelInt = 1

    if (userOptions && userOptions.option_value) {
      levelInt = userOptions.option_value
    }

    let userLevel = res.app.locals.helpers.intToLevel(levelInt)
    let levelHigher = res.app.locals.helpers.oneLevelHigher(userLevel)

    let userCourses = await Users.getMysqlProduction(`
          SELECT user_course_id as id, course_id as course
          FROM user_courses 
          WHERE user_id=${userId}
          ORDER BY last_modified DESC
        `)
    let enrolledCourses = userCourses.map((course) => course.course)

    let channelIds = [res.app.locals.helpers.levelToChannelId(userLevel), res.app.locals.helpers.levelToChannelId(levelHigher)]

    let leveledCourses = await Users.getMysqlProduction(`
          SELECT course_introduction, course_title, course_id as id 
          FROM course_detail 
          WHERE pubstatus=1 
          AND is_private=0
          AND order_id >= 1000
          AND course_id NOT IN (${enrolledCourses.join(',')})
          AND channel_id IN (${channelIds.join(',')})
        `)

        // console.log(leveledCourses);

    leveledCourses.forEach((course) => {
      course.course_introduction = sanitizeHtml(course.course_introduction, {
        allowedTags: [],
        allowedAttributes: {},
      })
    })

    let user = await userService.getUser(userId)

    if (user && user.email)
    Users.upsert({id:userId},{ moreCourses: leveledCourses });

    res.json(leveledCourses)
  }

}

exports.allLessons = async function(req, res, next) {

  let userId = req.session.userId
  let inputs = req.session.inputs

  let queryAddOn = []
  
  if (inputs && inputs.limit) {
    queryAddOn.push("LIMIT " + inputs.limit)
  }
  if (inputs && inputs.skip) {
    queryAddOn.push("OFFSET " + inputs.skip)
  }

  if (!userId) {
    res.json({err:'Invalid'})
  } else {

    let selectContents = res.app.locals.helpers.getLessonColumns()
    selectContents[0] = 'v3_id as id'
    let rawData = await Users.getMysqlProduction(`
          SELECT ${selectContents}
          FROM contents 
          WHERE publication_timestamp <= '${new Date()}' 
          AND status_published='publish'
          ORDER BY publication_timestamp DESC
          ${queryAddOn}
        `)
    
    // console.log(rawData);
    let cleanData = []
    for (let i=0; i < rawData.length; i++) { let lesson = rawData[i]
      lesson.userContents = await Users.getMysqlProduction(`
          SELECT *
          FROM user_contents 
          WHERE user_id=${userId} 
          AND v3_id='${lesson.id}'
        `)

      if (lesson.userContents[0]) {
        lesson.saved = lesson.userContents[0].saved
          ? lesson.userContents[0].saved
          : 0
        lesson.studied = lesson.userContents[0].studied
          ? lesson.userContents[0].studied
          : 0
        delete lesson.userContents
        cleanData.push(lesson)
      } else {
        delete lesson.userContents
        cleanData.push(lesson)
      }

      Lessons.upsert({id:lesson.id},rawData[i])
    }

    res.json(cleanData);
  }

}

exports.getBookMarkedLessons = async function(req, res, next) {

  let userId = req.session.userId
  let inputs = req.session.inputs

  let queryAddOn = []
  
  if (inputs && inputs.limit) {
    queryAddOn.push("LIMIT " + inputs.limit)
  }
  if (inputs && inputs.skip) {
    queryAddOn.push("OFFSET " + inputs.skip)
  }

  if (!userId) {
    res.json({err:'Invalid'})
  } else {
    let count = (await Users.getMysqlProduction(`
      SELECT COUNT(*) as count
      FROM user_contents 
      WHERE user_id=${userId} 
      AND saved=1
      AND lesson_type=0
    `))[0]

    let userLessons = await Users.getMysqlProduction(`
      SELECT saved, studied, v3_id, created_at as updatedAt
      FROM user_contents 
      WHERE user_id=${userId} AND lesson_type=0 AND saved=1
      ORDER BY created_at DESC
      ${queryAddOn.join("\n")}
    `)

    let columns = res.app.locals.helpers.getLessonColumns()
    columns[0] = "v3_id as id"

    let retArr = []
    for (let i=0; i < userLessons.length; i++) {
      let userLesson = userLessons[i]
      let lesson = (await Users.getMysqlProduction(`
        SELECT ${columns.join(',')}  
        FROM contents
        WHERE v3_id='${userLesson.v3_id}'
      `))[0];

      lesson.saved = userLesson.saved
      lesson.studied = userLesson.studied
      retArr.push(lesson)
    }

    let user = await userService.getUser(userId)

    if (user && user.email)
    Users.upsert({id:userId},{ bookmarks: retArr });

    res.json({count: count.count, lessons: retArr})
  }

}

exports.getStudiedLessons = async function(req, res, next) {

  let userId = req.session.userId
  let inputs = req.session.inputs

  let queryAddOn = []
  
  if (inputs && inputs.limit) {
    queryAddOn.push("LIMIT " + inputs.limit)
  }
  if (inputs && inputs.skip) {
    queryAddOn.push("OFFSET " + inputs.skip)
  }

  if (!userId) {
    res.json({err:'Invalid'})
  } else {
    let count = (await Users.getMysqlProduction(`
      SELECT COUNT(*) as count
      FROM user_contents 
      WHERE user_id=${userId} 
      AND studied=1
      AND lesson_type=0
    `))[0]

    let userLessons = await Users.getMysqlProduction(`
      SELECT saved, studied, v3_id, created_at as updatedAt
      FROM user_contents 
      WHERE user_id=${userId} AND lesson_type=0 AND studied=1
      ORDER BY created_at DESC
      ${queryAddOn.join("\n")}
    `)

    let columns = res.app.locals.helpers.getLessonColumns()
    columns[0] = "v3_id as id"

    let retArr = []
    for (let i=0; i < userLessons.length; i++) {
      let userLesson = userLessons[i]
      let lesson = (await Users.getMysqlProduction(`
        SELECT ${columns.join(',')}  
        FROM contents
        WHERE v3_id='${userLesson.v3_id}'
      `))[0];

      lesson.saved = userLesson.saved
      lesson.studied = userLesson.studied
      retArr.push(lesson)
    }

    let user = await userService.getUser(userId)

    if (user && user.email)
    Users.upsert({id:userId},{ history: retArr });

    res.json({count: count.count, lessons: retArr})
  }

}

exports.allCourses = async function(req, res, next) {

  let userId = req.session.userId
  let inputs = req.session.inputs

  if (!userId) {
    res.json({err:'Invalid'})
  } else {
    let courses = await Users.getMysqlProduction(`
          SELECT channel_id, course_image, course_introduction, course_title, hash_code, course_id as id 
          FROM course_detail 
          WHERE pubstatus=1
          AND is_private=0
          AND order_id >= 1000
          ORDER BY order_id DESC
        `)

    courses.forEach( async (course) => {
      
      let channels = await Users.getMysqlProduction(`
          SELECT channel_title
          FROM channel_detail 
          WHERE channel_id=${course.channel_id}
        `)
      if (channels && channels.length > 0) {
        course.channel_title = channels[0].channel_title
      }

      if (course && course.course_image) {
        course.course_image = "/images/courses/"+course.id+"/"+course.course_image
      }
      Course.upsert({id:course.id},course);
    })
    res.json(courses)
  }

}

exports.allPlaylists = async function(req, res, next) {

  let userId = req.session.userId
  let inputs = req.session.inputs

  if (!userId) {
    res.json({err:'Invalid'})
  } else {
    let courses = await Users.getMysqlProduction(`
          SELECT channel_id, course_image, course_introduction, course_title, hash_code, course_id as id 
          FROM course_detail 
          WHERE pubstatus=1
          AND is_private=0
          AND order_id >= 1000
          ORDER BY order_id DESC
        `)
    res.json(courses)
  }

}

exports.onboardingQuestions = async function(req, res, next) {

  let userId = req.session.userId
  let inputs = req.session.inputs

  const questions = require('../lib/onboarding.json')

  if (!userId) {
    res.json({err:'Invalid'})
  } else {
    let userOptions = await Users.getMysqlProduction(`
      SELECT * 
      FROM user_options 
      WHERE user_id=${userId}
    `)
    let userOptionsArr = {}
    for (let i=0; i < userOptions.length; i++) { 
      let entry = userOptions[i]
      userOptionsArr[entry.option_key] = entry.option_value
    }

    let toAsk = []

    questions.forEach((question) => {
      if (!userOptionsArr[question.key]) {
        toAsk.push(question)
      }
    })

    res.json({
      completeness: (questions.length - toAsk.length) / questions.length,
      questions: toAsk,
    })

  }

}

exports.getSuggestions = async function(req, res, next) {

  let userId = req.session.userId
  let inputs = req.session.inputs

  if (!userId) {
    res.json({err:'Invalid'})
  } else {
    // console.log("test");
    let userOptionsObj = await Users.getMysqlProduction(`
      SELECT * 
      FROM user_options 
      WHERE user_id=${userId}
    `)

    let userOptions = {}
    for (let i=0; i < userOptionsObj.length; i++) { let entry = userOptionsObj[i]
      userOptions[entry.option_key] = entry.option_value
    }
    // console.log(userOptions.interests);

    // STOP IF NO USER INTERESTS
    // if (!userOptions.interests) {
    //   res.json({})
    // }

    // //STOP IF NO USER LEVEL
    // if (!userOptions.level) {
    //   res.json({})
    // }

    if (!userOptions.level || !userOptions.interests) {
      res.json({})
    } else {

      let level = res.app.locals.helpers.intToLevel(userOptions.level)

      let interests = userOptions.interests.split(', ')

      // console.log(interests)

      let relevantCourseIds = []

      let logic = {
        business: function businessSuggestions(level) {
          switch (level) {
            case 'newbie':
            case 'elementary':
              return [927, 37]
            case 'preInt':
            case 'intermediate':
              return [965, 36, 22]
            case 'upperInt':
            case 'advanced':
              return [38, 925, 926]
            default:
              return []
          }
        },

        sports: function sportsSuggestions(level) {
          return [918, 931]
        },

        movies: function moviesSuggestions(level) {
          switch (level) {
            case 'newbie':
            case 'elementary':
            case 'preInt':
            case 'intermediate':
              return [930]
            case 'upperInt':
              return [967]
            case 'advanced':
              return [968]
            default:
              return []
          }
        },

        technology: function technologySuggestions(level) {
          switch (level) {
            case 'newbie':
            case 'elementary':
              return [969]
            case 'preInt':
            case 'intermediate':
              return [970]
            case 'upperInt':
              return [971]
            case 'advanced':
              return [972]
            default:
              return []
          }
        },

        history: function historySuggestions(level) {
          switch (level) {
            case 'upperInt':
            case 'advanced':
              return [973]
            default:
              return []
          }
        },

        literature: function literatureSuggestions(level) {
          switch (level) {
            case 'newbie':
            case 'elementary':
              return [963, 962]
            case 'preInt':
            case 'intermediate':
              return [963, 962, 966]
            case 'upperInt':
              return [974]
            case 'advanced':
              return [975]
            default:
              return []
          }
        },
      }

      interests.forEach((interest) => {
        relevantCourseIds = relevantCourseIds.concat(logic[interest](level))
      })

      let userCourses = await Users.getMysqlProduction(`
            SELECT default_status, course_id, user_course_id as id
            FROM user_courses
            WHERE user_id=${userId}
          `)
      let relevantCourses = await Users.getMysqlProduction(`
          SELECT course_introduction, course_title, course_id as id 
          FROM course_detail 
          WHERE pubstatus=1
          AND is_private=0
          AND course_id IN (${relevantCourseIds})
          AND course_id NOT IN (${userCourses.map((course) => course.course)})
        `)

      res.json({
        suggestions: relevantCourses.length > 0,
        courses: relevantCourses,
      })
    }

  }

}

exports.getCourse = async function(req, res, next) {

  let userId = req.session.userId
  let inputs = req.session.inputs

  if (!userId) {
    res.json({err:'Invalid'})
  } else {
      // unfinished API in LIVE
      // TODO : check live actual response 

    const { asyncForEach } = require('../frequent')

    // let courseDetails = await CourseDetail.findOne({ id: inputs.courseId })
    let courseDetails = (await Users.getMysqlProduction(`
          SELECT *
          FROM course_detail 
          WHERE course_id=${inputs.courseId}
        `))[0]
    // replace course_id to id
    if (courseDetails && courseDetails.course_id) {
      courseDetails.id = courseDetails.course_id
      delete courseDetails.course_id
    }

    // await CourseDetailMongo.updateOrCreate(
    //   { id: courseDetails.id },
    //   { ...courseDetails }
    // )

    let courseLessons = await Users.getMysqlProduction(`
          SELECT course_content_id as id, course_id, v3_id, displaysort, create_time as createdAt
          FROM course_contents
          WHERE course_id=${inputs.courseId}
          ORDER BY displaysort ASC
        `)

    // let courseLessons = await CourseContents.find({
    //   course_id: inputs.courseId,
    // })
    //   .sort('displaysort ASC')
    //   .populate('lesson')

    await asyncForEach(
      courseLessons.map(async (courseLesson) => {
        courseLesson.lesson = (await Users.getMysqlProduction(`Select * From contents 
                                  WHERE v3_id='${courseLesson.v3_id}' 
                              `))[0];
        courseLesson.lesson.id = courseLesson.lesson.v3_id
        return { ...courseLesson, lesson: courseLesson.lesson.v3_id }
      }),
        () => {
          
      }
    )


    // let userLessons = await UserContents.find({
    //   where: {
    //     user_id: inputs.userId,
    //     lesson_type: 0,
    //   },
    //   select: ['lesson', 'saved', 'studied', 'updatedAt'], //  'title', 'slug', 'image', 'hash_code', 'publication_timestamp'
    //   sort: 'updatedAt DESC',
    // })

    let userLessons = await Users.getMysqlProduction(`Select v3_id, saved, studied, created_at as updatedAt From user_contents 
        WHERE user_id=${userId} 
        AND studied=1
        AND lesson_type=0
        ORDER BY created_at DESC
    `);

    // POPULATE lesson
    for (let i=0; i < userLessons.length; i++) {
      userLessons[i].lesson = (await Users.getMysqlProduction(`Select * From contents 
          WHERE v3_id='${userLessons[i].v3_id}' 
      `))[0];
    }

    courseLessons.forEach((lesson) => {
      const savedLesson = userLessons.filter(
        (item) => lesson.lesson && item.lesson === lesson.lesson.id
      )
      if (savedLesson.length > 0) {
        lesson.lesson = {
          ...lesson.lesson,
          ...{ saved: savedLesson[0].saved, studied: savedLesson[0].studied },
        }
      }
    })

    res.json( {
      ...courseDetails,
      ...{ lessons: courseLessons },
    });
  }
}

exports.getAllLessons = async function(req, res, next) {

  let userId = req.session.userId
  let inputs = req.session.inputs

  let queryAddOn = []
  
  if (inputs && inputs.limit) {
    queryAddOn.push("LIMIT " + inputs.limit)
  }
  if (inputs && inputs.skip) {
    queryAddOn.push("OFFSET " + inputs.skip)
  }

  if (!userId) {
    res.json({err:'Invalid'})
  } else {

    let count = (await Users.getMysqlProduction(`
      SELECT COUNT(*) as count
      FROM contents 
      WHERE publication_timestamp <= '${new Date()}'
      AND status_published='publish'
    `))[0]

    let columns = res.app.locals.helpers.getLessonColumns()
    columns[0] = "v3_id as id"
    let rawData = await Users.getMysqlProduction(`
      SELECT ${columns.join(',')}
      FROM contents 
      WHERE publication_timestamp <= '${new Date()}'
      AND status_published='publish'
      ORDER BY publication_timestamp DESC
      ${queryAddOn.join("\n")}
    `)

    // populate user contents
    for (let i=0; i < rawData.length; i++) {
      rawData[i].userContents = await Users.getMysqlProduction(`Select v3_id, saved, studied, created_at as updatedAt 
                                    From user_contents 
                                    WHERE user_id=${userId} 
                                    AND v3_id=${rawData[i].id}
                                `); 
    }

    let cleanData = []
    rawData.forEach((lesson) => {
      if (lesson.userContents[0]) {
        lesson.saved = lesson.userContents[0].saved
          ? lesson.userContents[0].saved
          : 0
        lesson.studied = lesson.userContents[0].studied
          ? lesson.userContents[0].studied
          : 0
        delete lesson.userContents
        cleanData.push(lesson)
      } else {
        delete lesson.userContents
        cleanData.push(lesson)
      }
    })
    res.json( { count: count, lessons: cleanData })
  }

}

exports.setEmailConfirm = async function(req, res, next) {
  // console.log(req.query)

  if (!req.query || !req.query.email) {
    res.json({
      status:false,
      message: "Invalid parameters!"
    })
  }
  // let email = req.query.email

  let user = (await Users.getUserByEmailSQL(req.query.email))[0]
  // console.log(user);
  if (!user) {
    res.json({
      status:false,
      message: "Invalid parameters!"
    })
  } else {
    // check mongo records if note in mongo store new record in mongo
    let sqlQuery = `UPDATE users
    SET confirm_status = 1
    WHERE id=${user.id}`;

    let updateResponse = await Users.getMysqlProduction(sqlQuery)
    // console.log("update response ",updateResponse.affectedRows);
    if (updateResponse && updateResponse.affectedRows) {

      let mongoUser = (await Users.findQuery({id:user.id}))[0]

      // ADD OR UPDATE USERS MONGO RECORD
      if (mongoUser) {
        Users.upsert({id:user.id},{confirmStatus:1})
      } else {
        userService.getUserStats(user.id)
      }

      res.json({
        status:true,
        message: "Updated!"
      })
    } else {
      res.json({
        status:false,
        message: "Failed to update record!"
      })
    }
  }

}





