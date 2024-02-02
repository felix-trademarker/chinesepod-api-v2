let userService = require('../services/userService')
let Users = require('../repositories/users')



exports.fn = async function(req, res, next) {
    
  let userId = req.session.userId
  let inputs = req.session.inputs

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
      FROM contents 
      WHERE publication_timestamp <= '${new Date()}'
      AND status_published='publish'
    `))[0]

    let columns = res.app.locals.helpers.getLessonColumns()
    columns[0] = "v3_id as id"
    let rawData = await Users.getMysqlProduction(`
      SELECT ${columns.join(',')}
      FROM contents 
      WHERE publication_timestamp <= '${new Date()}'
      AND status_published='publish'
      ORDER BY publication_timestamp DESC
      ${queryAddOn.join("\n")}
    `)

    // populate user contents
    for (let i=0; i < rawData.length; i++) {
      rawData[i].userContents = await Users.getMysqlProduction(`Select v3_id, saved, studied, created_at as updatedAt 
                                    From user_contents 
                                    WHERE user_id=${userId} 
                                    AND v3_id=${rawData[i].id}
                                `); 
    }

    let cleanData = []
    rawData.forEach((lesson) => {
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
    })
    res.json( { count: count, lessons: cleanData })
  }
  
} 
