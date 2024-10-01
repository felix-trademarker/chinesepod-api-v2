let Users = require('../repositories/users')

exports.fn = async function(req, res, next) {

  let campaigns = await Users.getMysqlProduction(`
            SELECT DISTINCT(option_value) as campaign FROM user_options
            where option_key='campaignid'
            order by last_update DESC
            `)

  res.json(campaigns)

  
}