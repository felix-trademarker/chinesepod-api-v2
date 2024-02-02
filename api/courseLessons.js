let userService = require('../services/userService')
let Users = require('../repositories/users')


exports.fn = async function(req, res, next) {
    
  let userId = req.session.userId

  if (req.params.userId) userId = req.params.userId 

  if (req.query.userId) userId = req.query.userId 

  let courseId = req.query.courseId;
  let exclude = req.query.exclude;
  let limit = req.query.limit;
  let all = req.query.all;

  // userId= "1197231"

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
