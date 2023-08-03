let Users = require('../repositories/users')
let UsersApi = require('../repositories/users.api')
let LessonFile = require('../repositories/lessonFiles')
let Lesson = require('../repositories/lessons')

let UserPhpSessionAWS = require('../repositories/users.phpsessionAWS')
let UserPhpSession = require('../repositories/users.phpsession')
let helpers = require('../helpers')
let axios = require('axios');

exports.getAccessTypeAndExpiry = async function(userId) {
    
    
      let szTeacherLinks = (await Users.getMysqlProduction(`Select * From sz_org_staff WHERE user_id=${userId} AND confirmed=1`))[0]

      if (szTeacherLinks && szTeacherLinks.length) {
        
        szTeacherLinks.org_id = (await Users.getMysqlProduction(`Select * From sz_organizations WHERE id=${szTeacherLinks.org_id}`))[0]
        const activeSchools = szTeacherLinks
          .map((i) => i && i.org_id)
          .filter((i) => i && i.status === 2)
        if (activeSchools && activeSchools.length) {
        //   sails.log.info(activeSchools[0])
          return { type: 'premium', expiry: activeSchools[0].expiry }
        }

      }

      let szStudentLinks = (await Users.getMysqlProduction(`Select * From sz_students WHERE user_id=${userId} AND confirmed=1`))[0]
  
      if (szStudentLinks && szStudentLinks.length) {

        szStudentLinks.org_id = (await Users.getMysqlProduction(`Select * From sz_organizations WHERE id=${szTeacherLinks.org_id}`))[0]
        const activeSchools = szStudentLinks
          .map((i) => i && i.org_id)
          .filter((i) => i && i.status === 2)
        if (activeSchools && activeSchools.length) {
          return { type: 'premium', expiry: activeSchools[0].expiry }
        }
      }
  
      let userAccess = (await Users.getMysqlProduction(`Select * From user_site_links WHERE user_id=${userId}`))[0]
      if (userAccess && userAccess.usertype_id) {
        return {
          type: helpers.accessMap(userAccess.usertype_id),
          expiry: userAccess.expiry,
        }
      } else {
        return { type: 'free', expiry: new Date() }
      }
}

exports.getUser = async function(userId) {
    
    
  let user = (await Users.getMysqlProduction(`Select * From users WHERE id=${userId}`))[0]

  return user;

}

exports.migrateSession = async function() {
  console.log("migration called");

  //  =========== working function below commented out since in aws mongo return empty
  // let page = 0, limit = 100;
  // let total = await UserPhpSessionAWS.count()
  // console.log("total", total);
  // for (; page < Math.ceil(total/limit); page++) {
  //   console.log(` >>> FETCHING ${limit} RECORDS IN AWS ${(page+1)} of ${Math.ceil(total/limit)} <<< `);
  //   let usersSessions = await UserPhpSessionAWS.paginate(page*limit, limit)
  
  //   if (usersSessions) 
  //   for(let i=0; i < usersSessions.length; i++){
  //     let userSession = usersSession[i]
  //     console.log("adding session ID >> ", userSession.id);
  //     await UserPhpSession.upsert({id:userSession.id},userSession)
  //   }
  // }
  
}

exports.getRequestAPI = async function(req, res, next) {

  // console.log("method",req.headers)
  // console.log("method",req.params)
  try {
    let path = req.originalUrl ? req.originalUrl.replace("v2", "v1") : req.originalUrl;
    path = path.replace("proxy/","")
    // console.log(req.headers);
    let url = "https://www.chinesepod.com" + path

    // clean auth string
    let token = req.headers.authorization 
    if (token){
      token = token.replace("Bearer","").trim()
    } else {
      token = req.session.token
    }

    var options;

    if (path == "/api/v1/entrance/get-user") {
      options = {
        'method': req.method,
        'url': url,
        'headers': {
          'Cookie': req.headers.cookies,
          'Content-Type': 'text/plain; charset=utf-8',
        },
        'redirect': 'follow'
      };
    } else {
      options = {
        'method': req.method,
        'url': url,
        'headers': {
          'Authorization': 'Bearer ' + token,
          'Cookie': req.headers.cookies,
          'Content-Type': 'text/plain; charset=utf-8',
        },
        'body': JSON.stringify(req.body) 
      };
    }

    // console.log("options",options);


    // CHECK REQUEST TYPE

    let data = await axios(options)
    // switch(req.method) {
    //   case 'POST': 
    //     data = await axios.post(url,options)
    //   break;
    //   case 'PUT': 
    //   data = await axios.put(url,options)
    //   break;
    //   case 'PATCH': 
    //   data = await axios.patch(url,options)
    //   break;
    //   case 'DELETE': 
    //   data = await axios.delete(url,options)
    //   break;
    //   default: 
    //     data = await axios.get(url,options)
    //   break;
    // }
    
    return data

  } catch (err) {
    console.log("API ERROR",err)
    return err.response
  }
  
}

exports.recordServe = async function(req, response) {

  let path = req.originalUrl.replace("v2", "v1")

  let modelObj = helpers.getCollectionFromUrl(path)
  
  console.log("check path and return corresponding collection name", modelObj)
  if (modelObj && modelObj.action)  
  switch(modelObj.action){
    case 'history' : 
    case 'bookmarks' : 
    case 'courses' : 
    case 'stats' : 
    case 'info' : 
      // update user fetch userId from session token
      let data = {
        userId: req.session.userId
      }
      data[modelObj.action] = response.data
      Users.upsert({userId: req.session.userId}, data)
    break
  }
}

// exports.getUserEntrance = async function(req, res, next) {
//   try {
//     var options = {
//       'headers': {
//         'Authorization': "Bearer " + req.session.token,
//         'Cookie': req.headers.cookie,
//       }
//     };
  
//     let path = req.originalUrl.replace("v2", "v1")
//     let url = res.app.locals.helpers.getDomain() + path
//     let data = await axios.get(url,options)
    
//     return data

//   } catch (err) {
//     console.log(err.response)
//     return err.response
//   }
// }

// test
exports.udpateLessonFiles = async function() {
  let lessons = await Lesson.getMysqlProduction(`
                SELECT v3_id as id, video
                FROM contents 
                WHERE video <> ''
              `)

  console.log(lessons.length);

  // 6hmajyyou7.mp4
  // let source = await LessonFile.findDynamoDB('srcVideo', 'eid339jkty.mp4', 1)
  // console.log(source);

  // return;
  for (let i=0; i < lessons.length; i++) {
    let lesson = lessons[i]

    let source = (await LessonFile.findDynamoDB('srcVideo', lesson.video + '.mp4'))[0]

    // source.id = lesson.id

    let sourceData = {
      id: lesson.id,
      videoId: lesson.video,
      srcVideo: source ? source.srcVideo : ''
    }

    // if (!source)
    // sourceData.srcVideo = "https://d3glhinmyc42ep.cloudfront.net/2cc1a95f-a5b3-4642-b9e6-73823d3b7e9c/hls/"+lesson.video+".m3u8"

    LessonFile.upsert({id: sourceData.id}, sourceData)
    console.log(lesson.video,source)
  }

  console.log("-end-")

}

exports.findAWSFile = async function(key) {
  let data = await LessonFile.findAWSFile(key);
}