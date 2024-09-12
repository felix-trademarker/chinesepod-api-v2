let userService = require('../services/userService')
let Users = require('../repositories/users')
let crmUsersMongoAws = require('../repositories/crmUsersMongoAWS')
let _ = require('lodash')
var ModelRedis = require('../repositories/_modelRedis')
let redisClient = new ModelRedis('users.info')

exports.fn = async function(req, res, next) {

  let userId = req.session.userId

  if (req.params.userId) userId = req.params.userId 

  // if (!userId) {
  //   throw 'invalid'
  // }
  // userId= "1297653"
  if(userId) {
    let returnData = {}

    // save userData in mongo158
    userService.getUserStats(userId)

    let userData;

    // FETCH FROM REDIS RECORDS
    try {
      userData = await redisClient.get(userId)
      console.log("fetch userdata from redis")
    } catch (err) {
      console.log("Failed to fetch Redis Records")
    }

    // FETCH MONGO
    if (!userData){
      try {
        userData = (await Users.findQuerySelected({
          id: userId,
        },{ 
          email:1, 
          id: 1, 
          code: 1,
          trial: 1,
          name: 1,
          username: 1,
          confirmStatus: 1,
          createdAt: 1
        }))[0];

        userData.confirm_status = userData.confirmStatus
        userData.createdAt = userData.created_at
      } catch (err) {
        userData = (await Users.getMysqlProduction(`Select * From users WHERE id=${userId}`))[0]
      }
  
    }

    // FETCH MYSQL
    if (!userData){
      userData = (await Users.getMysqlProduction(`Select * From users WHERE id=${userId}`))[0]
    }

    if (!userData){
      res.json({})
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

      let newLastLogin = 0
      let oldLastLogin = 0

      // if (userData.admin_note && Number.isInteger(userData.admin_note)) {
      //   newLastLogin = new Date(userData.admin_note)
      //   // newLastLogin = res.app.locals.moment(userData.admin_note).format("L")
      // }
      // console.log(userData.admin_note, res.app.locals.moment.unix('1707881416').format());

      if (userPreferences && userPreferences['last_login_ip']) {
        oldLastLogin = new Date(userPreferences['last_login_ip'])
      }

      let lastLogin = newLastLogin > oldLastLogin ? newLastLogin : oldLastLogin

      let szStudentLinks
      let szTeacherLinks

      if (!userData.szStudentLinks){
        szStudentLinks = await Users.getMysqlProduction(`Select * From sz_students WHERE user_id=${userId} AND confirmed=0`)
      } else {
        szStudentLinks = userData.szStudentLinks
      }
      
      if (szStudentLinks && szStudentLinks.length) {
        returnData.szStudentLinks = szStudentLinks.map((i) =>
          _.pick(i, ['id', 'createdAt'])
        )
        userData.szStudentLinks = returnData.szStudentLinks
      }

      if (!userData.szTeacherLinks){
        szTeacherLinks = await Users.getMysqlProduction(`Select * From sz_org_staff WHERE user_id=${userId} AND confirmed=0`)
      } else {
        szTeacherLinks = userData.szTeacherLinks
      }

      if (szTeacherLinks && szTeacherLinks.length) {
        returnData.szTeacherLinks = szTeacherLinks.map((i) =>
          _.pick(i, ['id', 'createdAt'])
        )
      }

      if (!userData.isTeam) {
        const isTeam = (await Users.getMysql2015(`Select * From Users WHERE email='${userData.email}' AND status=1`))[0]

        if (isTeam) {
          userData.isTeam = isTeam
          await crmUsersMongoAws.upsert({ id: isTeam.id }, { ...isTeam })
        }
      }
      

      // add hook to update user collection with user_contents
      userService.updateUserContents(userId)

      let contents = {
        ...returnData,
        ...userOptions,
        ...{
          isTeam: !!userData.isTeam,
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

      redisClient.set(userId, JSON.stringify(userData))

      // res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      // res.setHeader("Pragma", "no-cache");
      // res.setHeader("Expires", 0);

      if (access == 'deleted') {
        res.json(null)
      } else {
        res.json(contents);
      }

    } catch (e) {
      console.log(e);
    }
  } else {
    res.json({})
  }

  
} 
