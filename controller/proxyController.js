let userService = require('../services/userService')
let helpers = require('../helpers')
let LessonDownloads = require('../repositories/lessonDownloads')
let Lessons = require('../repositories/lessons')

exports.serveAPI = async function(req, res, next) {

  // console.log(req)
  let response = await userService.getRequestAPI(req, res, next)

  let path = req.originalUrl.replace("v2", "v1")

  // let modelObj = helpers.getCollectionFromUrl(path)

  console.log(path);
  let uri = path.split("/")
  let reqName = (uri[uri.length - 1].split("?"))[0]
  let lessonId = (uri[uri.length - 1].split("?"))[1].split("=")[1]
  console.log(reqName, lessonId);

  if (reqName && lessonId) {

    let saveData = response.data

    if (reqName == "get-downloads") {
      Lessons.upsert({id:lessonId},{downloads: saveData.downloads})
    } else if (reqName == "get-grammar") {
      Lessons.upsert({id:lessonId},{grammar: saveData})
    } else if (reqName == "get-dialogue") {
      Lessons.upsert({id:lessonId},{dialogue: saveData})
    } else if (reqName == "get-vocab") {
      Lessons.upsert({id:lessonId},{vocabulary: saveData})
    } else if (reqName == "get-expansion") {
      Lessons.upsert({id:lessonId},{expansion: saveData})
    } else if (reqName == "get-comments") {
      Lessons.upsert({id:lessonId},{comments: saveData})
    } else if (reqName == "get-questions") {
      Lessons.upsert({id:lessonId},{questions: saveData})
    }
    
  }




  res.json(response.data)

}
