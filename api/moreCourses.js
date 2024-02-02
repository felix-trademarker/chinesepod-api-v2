let userService = require('../services/userService')
let Users = require('../repositories/users')
let _ = require('lodash')
const sanitizeHtml = require('sanitize-html')

exports.fn = async function(req, res, next) {
    
  let userId = req.session.userId
  // userId= "1197231"
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
