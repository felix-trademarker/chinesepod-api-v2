let LessonNewSources = require('../repositories/lessonNewSources')

exports.getLessonURLNew = async function(req, res, next) {

  let newHls = (await LessonNewSources.findQuery({v3_id:req.params.v3Id }))[0]
    // await redisClientLessonVideos.set(req.params.v3Id, JSON.stringify(newHls))
  
  res.json(newHls)
  
}




