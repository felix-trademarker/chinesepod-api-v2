let Users = require('../repositories/users')
let Lessons = require('../repositories/lessons')
let _ = require('lodash')

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

    let selectContents = res.app.locals.helpers.getLessonColumns()
    selectContents[0] = 'v3_id as id'
    let rawData = await Users.getMysqlProduction(`
          SELECT ${selectContents}
          FROM contents 
          WHERE publication_timestamp <= '${new Date()}' 
          AND status_published='publish'
          ORDER BY publication_timestamp DESC
          ${queryAddOn}
        `)
    
    // console.log(rawData);
    let cleanData = []
    for (let i=0; i < rawData.length; i++) { let lesson = rawData[i]
      lesson.userContents = await Users.getMysqlProduction(`
          SELECT *
          FROM user_contents 
          WHERE user_id=${userId} 
          AND v3_id='${lesson.id}'
        `)

      if (lesson.userContents[0]) {
        lesson.saved = lesson.userContents[0].saved
          ? lesson.userContents[0].saved
          : 0
        lesson.studied = lesson.userContents[0].studied
          ? lesson.userContents[0].studied
          : 0
        delete lesson.userContents
        cleanData.push(lesson)
      } else {
        delete lesson.userContents
        cleanData.push(lesson)
      }

      Lessons.upsert({id:lesson.id},rawData[i])
    }

    res.json(cleanData);
  }
  
} 
