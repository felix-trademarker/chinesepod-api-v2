let userService = require('../services/userService')
let Users = require('../repositories/users')



exports.fn = async function(req, res, next) {
    
  let userId = req.session.userId
  let inputs = req.session.inputs
  // userId= "1197231"
  if (!userId) {
    res.json({err:'Invalid'})
  } else {

    let userOptionsObj = await Users.getMysqlProduction(`
      SELECT * 
      FROM user_options 
      WHERE user_id=${userId}
    `)

    let userOptions = {}
    for (let i=0; i < userOptionsObj.length; i++) { let entry = userOptionsObj[i]
      userOptions[entry.option_key] = entry.option_value
    }

    if (!userOptions.level || !userOptions.interests) {
      res.json({})
    } else {

      let level = res.app.locals.helpers.intToLevel(userOptions.level)

      let interests = userOptions.interests.split(', ')

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
