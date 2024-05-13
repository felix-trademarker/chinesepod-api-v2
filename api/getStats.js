let userService = require('../services/userService')
let Users = require('../repositories/users')
let Lessons = require('../repositories/lessons')
let Course = require('../repositories/courses')
let crmUsersMongoAws = require('../repositories/crmUsersMongoAWS')
let Subscriptions = require('../repositories/subscriptions')
let _ = require('lodash')
const sanitizeHtml = require('sanitize-html')


exports.fn = async function(req, res, next) {
  let userId = req.session.userId

  if (req.params.userId) userId = req.params.userId 

  // userId= "1197231"
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


  let userPreferences = (await Users.getMysqlProduction(`Select * From user_preferences WHERE user_id=${userId} ORDER BY updated_at DESC`))[0]

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

  // res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  // res.setHeader("Pragma", "no-cache");
  // res.setHeader("Expires", 0);

  res.json(retData);

  
} 
