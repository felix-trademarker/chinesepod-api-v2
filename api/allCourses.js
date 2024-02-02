let userService = require('../services/userService')
let Users = require('../repositories/users')



exports.fn = async function(req, res, next) {
    
  let userId = req.session.userId
  let inputs = req.session.inputs
  // userId= "1197231"
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
