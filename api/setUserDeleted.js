let userService = require('../services/userService')
let Users = require('../repositories/users')


exports.fn = async function(req, res, next) {

  // get user ID
  let sessionId = req.params.id

  // let authToken = req.headers.authorization

  
  let userSession = (await Users.getMysqlProduction("SELECT ns.session_user_id, u.id FROM ny_session ns LEFT JOIN users u ON u.email=ns.session_user_id WHERE ns.session_id='"+sessionId+"'"))[0]
  console.log(userSession);

  // return;
  if (userSession) {
    // check session ID
    // let userSession = (await Users.getMysqlProduction("SELECT ns.session_user_id, u.id FROM ny_session ns LEFT JOIN users u ON u.email=ns.session_user_id WHERE ns.session_id='"+authToken+"'"))[0]
    userIdSession =  userSession ? userSession.id : null;
    console.log(userIdSession)
  }

  // return;

  if (!userIdSession) {
    res.json({
      status: false,
      message: "Permission denied"
    });
    // console.log('asd');

  } else {
    let userId = userIdSession
    // udpate records
    if (userId) {
      let user = (await Users.getUserByIdSQL(userId))[0]
      if (user) {
        let userSiteLinksQuery = "select id, user_id, usertype_id from user_site_links where user_id="+user.id+" and site_id=2"
        let updateQuery = "update user_site_links set usertype_id=20 where user_id="+user.id+" and site_id=2";

        let userSiteLinks = (await Users.getMysqlProduction(userSiteLinksQuery))[0]
        let response = await Users.getMysqlProduction(updateQuery)

        // res.json(response);
        if (response) {

          // add record in users options 
          let getDeletedPreference = (await Users.getMysqlProduction("select * from user_options where user_id="+userId+" and option_key='deleted'"))[0]

          // console.log(getDeletedPreference);

          if (!getDeletedPreference) {
            // add deleted record
            Users.getMysqlProduction(`INSERT INTO user_options (user_id,option_key,option_value) values (${userId},'deleted','${userSiteLinks.usertype_id}')`)
          } else {
            // update deleted record
            Users.getMysqlProduction(`update user_options set option_value='${userSiteLinks.usertype_id}' where user_id=${userId} and option_key='deleted'`)
          }

          res.json({
            status: true,
            message: "User access type udpated"
          });
        } else {
          res.json({
            status: false,
            message: "Invalid user ID"
          });
        }

      } else {
        res.json({
          status: false,
          message: "User does not exist"
        });
      }
    } else {
      res.json({
        status: false,
        message: "Invalid ID"
      });
    }
  }
  

  // res.json({});

  
} 
