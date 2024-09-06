let Users = require('../repositories/users')
let axios = require('axios')
const jwToken = require('jsonwebtoken');

exports.fn = async function(req, res, next) {
  
  let randomToken = require('rand-token');

    let inputs = req.body

    var userRecord = null

    try {
      userRecord = (await Users.findQuerySelected({
        email: inputs.emailAddress.toLowerCase(),
      },{email:1, password: 1, id: 1, code: 1}))[0];

    } catch (err) {
      userRecord = (await Users.getMysqlProduction(`SELECT email, password, code, id FROM users WHERE email='${inputs.emailAddress.toLowerCase()}'`))[0];
    }

    if ( !inputs.emailAddress 
      || !inputs.password 
      || !userRecord
    ) {
      res.send('Unauthorized')
    }

    const submittedPass = res.app.locals.helpers.passwordHash(inputs);

    if (submittedPass !== userRecord.password){
      res.send('Unauthorized')
    }

    const refreshToken = randomToken.uid(128);
    console.log(refreshToken)

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

    // try {
    //   // send user Id for syncing users session
    //   let axiosOptions = {
    //     'method': 'POST',
    //     'url': 'http://localhost:1337/api/v1/entrance/hash/login',
    //     'headers': {
    //       'Authorization': 'Bearer ' + token,
    //       'Cookie': req.headers.cookies,
    //       'Content-Type': 'text/plain; charset=utf-8',
    //     },
    //     'body': JSON.stringify(syncData) 
    //   };
    //   axios(axiosOptions)

    //   const response = await axios.post('https://www.chinesepod.com/api/v1/entrance/hash/login', {
    //     id: userRecord.id,
    //     emailAddress: userRecord.email
    //   }, {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': 'Bearer yourToken',
    //       'Authorization': 'Bearer ' + token,
    //     }
    //   });
    // } catch (e) {
    //   console.log("==FAILED TO LOGIN USER IN OTHER SERVER==")
    // }
    
    

    // console.log(syncDataResponse)

    res.json ({
      token: token,
      refreshToken: refreshToken
    });
    
}