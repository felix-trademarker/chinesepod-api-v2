let userService = require('../services/userService')
let Users = require('../repositories/users')



exports.fn = async function(req, res, next) {
    
  let userId = req.session.userId
  let inputs = req.session.inputs
  // userId= "1197231"
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
