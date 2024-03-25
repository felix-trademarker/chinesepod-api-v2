let userService = require('../services/userService')
let Users = require('../repositories/users')


exports.fn = async function(req, res, next) {

  let inputs = {
    userId: req.params.id,
    dash: req.query.dash,
    v3Id: req.query.v3id
  }
  console.log(inputs);
  let user = await userService.logUserDash(inputs)

  if (user){
    let userMongo = (await Users.findQuery({id:user.id}))[0]

    console.log("==================== added user log site visited " + userMongo.id + " ========================");
    res.json(userMongo)
  } else {
    res.json({})
  }

  
  
}