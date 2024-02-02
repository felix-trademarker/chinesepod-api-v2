let userService = require('../services/userService')
let Users = require('../repositories/users')


exports.fn = async function(req, res, next) {
    
  let userId = req.session.userId

  if (req.params.userId) userId = req.params.userId 

  if (req.query.userId) userId = req.query.userId 
  // userId= "1197231"
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