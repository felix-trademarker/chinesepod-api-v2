let Lessons = require('../repositories/lessons')

let _ = require('lodash')



exports.fn = async function(req, res, next) {
  let userId = req.session.userId
  let inputs = req.session.inputs

  let lessonComments = await Lessons.getMysqlProduction(`select c.id, c.content, c.reply_to_id, c.reply_to_id_2, c.reply_to_user_id, c.comment_from, c.created_at,
  c.user_id, u.username, p.avatar_url
  from comments c
  left join users u on c.user_id=u.id
  left join user_preferences p on p.user_id=c.user_id
  where c.parent_id = '${inputs.lessonId}' and c.type = 'lesson'`)

  _.each(lessonComments, function (comment) {
    if (comment.reply_to_id && comment.reply_to_id > 0) {
      let parent = lessonComments.find((x) => x.id === comment.reply_to_id)
      if (parent) {
        if (!parent.nestedComments) {
          parent.nestedComments = []
        }
        parent.nestedComments.push(comment)
      }
    }
  })

  let returnData = {
    count: lessonComments.length,
    comments: lessonComments
      .filter((comment) => comment.reply_to_user_id === 0)
      .sort((a, b) => b.created_at - a.created_at),
  }

  Lessons.upsert({id:inputs.lessonId}, {comments: returnData});

  res.json( returnData )
}