let Users = require('../repositories/users')
let axios = require('axios')
const jwToken = require('jsonwebtoken');

exports.fn = async function(req, res, next) {
  
  let randomToken = require('rand-token');

  let inputs = req.params
  console.log(inputs)
  var userRecord = null

  try {
    userRecord = (await Users.findQuerySelected({
      code: inputs.code,
    },{email:1, password: 1, id: 1, code: 1}))[0];

  } catch (err) {
    userRecord = (await Users.getMysqlProduction(`SELECT email, password, code, id FROM users WHERE code='${inputs.code}'`))[0];
  }

  if (!userRecord) {
    userRecord = (await Users.getMysqlProduction(`SELECT email, password, code, id FROM users WHERE code='${inputs.code}'`))[0];
  }

  if ( !inputs.code 
    || !userRecord
  ) {
    res.send('Unauthorized')
  }

  const refreshToken = randomToken.uid(128);
  console.log(refreshToken, userRecord)

  // STORE REFRESH TOKEN IN MYSQL 
  let query = (`INSERT INTO refresh_tokens SET ?`)
  await Users.getMysqlProduction( query, {
    user_id: userRecord.id,
    refresh_token: refreshToken,
    expiry: new Date(Date.now() + (process.env.jwtRefreshExpiry * 1) ), // 3months expiry
    client_id: inputs.clientId,
    ip_address: req.ip,
    user_agent: req.headers['user-agent']
  } )

  // generate token
  let token = jwToken.sign({userId: userRecord.id, isTeam: (userRecord && userRecord.email && userRecord.email.endsWith('@chinesepod.com'))}, process.env.jwtSecret)
  let syncData = {
    emailAddress: userRecord.email,
    password: userRecord.password,
    code: userRecord.code,
    id: userRecord.id
  }


  res.json ({
    token: token,
    refreshToken: refreshToken
  });
    
}