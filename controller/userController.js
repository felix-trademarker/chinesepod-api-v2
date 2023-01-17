let userService = require('../services/userService')
let Users = require('../repositories/users')
let _ = require('lodash')

exports.getUser = async function(req, res, next) {

  console.log("req ==> ", req.session)
  // let user = await res.app.locals.helpers.getCurrentUser()
  res.json(req);

}

exports.getInfo = async function(req, res, next) {
    
    let userId = '1197231'

    console.log("request",req);

    // inputs.userId = this.req.session.userId // alt 1026587

    if (!userId || typeof userId === 'undefined') {
        throw 'invalid'
    }

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


  
}
  