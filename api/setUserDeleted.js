let userService = require('../services/userService')
let Users = require('../repositories/users')


exports.fn = async function(req, res, next) {

  // console.log(req.params.id, userId)
  // get user ID
  let userId = req.params.id

  // udpate records
  if (userId) {
    let user = (await Users.getUserByIdSQL(userId))[0]
    if (user) {

      let updateQuery = "update user_site_links set usertype_id=20 where user_id="+user.id+" and site_id=2";

      let response = await Users.getMysqlProduction(updateQuery)

      // res.json(response);
      if (response) {
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
      message: "Invalid user ID"
    });
  }

  // res.json({});

  
} 
