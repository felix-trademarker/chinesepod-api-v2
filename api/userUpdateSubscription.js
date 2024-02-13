let Users = require('../repositories/users')

exports.fn = async function(req, res, next) {
  
  let inputs = req.query
  
  // console.log(inputs);


  if(inputs.userId && inputs.secret == "mikerocks123") {
    let userData;
    if ( ! isNaN(inputs.userId)) {
      userData = (await Users.findQuery({id:Number(inputs.userId)}))[0] 
    } else {
      userData = (await Users.findQuery({email:inputs.userId}))[0] 
    }

    let updateData = {
      access: 'premium',
      accessType: {
        type: 'premium',
        expiry: res.app.locals.moment(inputs.expiry,'L').format()
      }
    }
    // UPDATE VIA MONGO
    let updateResponse = await Users.upsert({id:userData.id}, updateData)
    console.log(res.app.locals.moment(inputs.expiry,'L').format('YYYY-MM-DD HH:mm:ss'))
    let mysqlQuery = `UPDATE user_site_links
                      SET expiry = '${res.app.locals.moment(inputs.expiry,'L').format('YYYY-MM-DD HH:mm:ss')}', usertype_id = 5
                      WHERE user_id=${Number(inputs.userId)}`
    let mysqlResponse = await Users.getMysqlProduction(mysqlQuery)

    console.log(mysqlResponse)
 
    res.json({status: 1});

  } else {
    res.json({status: 0});
  }

} 
