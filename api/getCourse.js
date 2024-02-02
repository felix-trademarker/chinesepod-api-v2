let userService = require('../services/userService')
let Users = require('../repositories/users')



exports.fn = async function(req, res, next) {
    
  let userId = req.session.userId
  let inputs = req.session.inputs
  // userId= "1197231"
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
