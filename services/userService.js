let Users = require('../repositories/users')

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

  try {
    var options = {
      'headers': {
        'Authorization': "Bearer " + req.session.token,
        'Cookie': req.headers.cookie,
      }
    };
  
    let path = req.originalUrl.replace("v2", "v1")
    let url = res.app.locals.helpers.getDomain() + path
    let data = await axios.get(url,options)
    
    return data

  } catch (err) {
    // console.log(err.response)
    return err.response
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