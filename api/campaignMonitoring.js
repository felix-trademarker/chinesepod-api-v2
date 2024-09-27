let Users = require('../repositories/users')

exports.fn = async function(req, res, next) {

  console.log(req.params.campaignId)

  let campaignId = req.params.campaignId

  if (!campaignId) {
    res.json({})
  } else {

    let users = await Users.getMysqlProduction(`
            SELECT u.user_id, us.usertype_id FROM user_options u
            LEFT JOIN user_site_links us
            ON us.user_id = u.user_id
            where option_key='campaignid' and option_value='${campaignId}'`)

    // if (!users) {
    //   res.json({
    //     campaignId: campaignId,
    //     count: users.length
    //   })
    // }

    // let p=[], f=[]

    // for (let i=0; i < users.length; i++) {

    // }
    let pUsers = users.filter(u => u.usertype_id === 5);

    console.log(users)
    res.json({
      campaignId: campaignId,
      count: users.length,
      premiumUsers: pUsers.length,
      freeUsers: users.length - pUsers.length
    })

  }

  
}