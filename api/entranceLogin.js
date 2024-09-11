let Users = require('../repositories/users')
// let axios = require('axios')
const jwToken = require('jsonwebtoken');

exports.fn = async function(req, res, next) {
  
  let randomToken = require('rand-token');

  let inputs = req.body

  var userRecord = null

  // console.log(inputs)
  if (!inputs.emailAddress || !inputs.password ) {
    // send json format missing parameters
    let problems = []

    if (!inputs.emailAddress) {
      problems.push("\"emailAddress\" is required, but it was not defined.")
    }

    if (!inputs.password) {
      problems.push("\"password\" is required, but it was not defined.")
    }

    res.status(401).json({
      error: "Missing or Invalid parameters",
      code: "E_MISSING_OR_INVALID_PARAMS",
      problems: problems,
      message: "The server could not fulfill this request (`POST /api/v2/entrance/login`) due to "+problems.length+" missing or invalid parameter."
    });

    // res.json({
    //   "code": "E_MISSING_OR_INVALID_PARAMS",
    //   "problems": problems,
    //   "message": "The server could not fulfill this request (`POST /api/v2/entrance/login`) due to "+problems.length+" missing or invalid parameter."
    // })
    
  } else {

    let emailAddress = inputs.emailAddress ? inputs.emailAddress.toLowerCase() : '';

    try {
      userRecord = (await Users.findQuerySelected({
        email: emailAddress,
      },{email:1, password: 1, id: 1, code: 1}))[0];

    } catch (err) {
      userRecord = (await Users.getMysqlProduction(`SELECT email, password, code, id FROM users WHERE email='${emailAddress}'`))[0];
    }

    if ( !userRecord ) {
      userRecord = (await Users.getMysqlProduction(`SELECT email, password, code, id FROM users WHERE email='${emailAddress}'`))[0];
    }

    const submittedPass = res.app.locals.helpers.passwordHash(inputs);

    if (userRecord && submittedPass !== userRecord.password){

      res.status(401).json({
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
        message: "The email or password you entered is incorrect"
      });

      // res.json({
      //   "code": "INVALID_CREDENTIALS",
      //   "problems": "The email or password you entered is incorrect",
      //   "message": "The server could not fulfill this request (`POST /api/v2/entrance/login`) due to email or password is incorrect"
      // })
    } else {
      const refreshToken = randomToken.uid(128);
      // console.log(refreshToken)
  
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
      let token = jwToken.sign(
        {
          data : {
            userId: userRecord.id, 
            isTeam: (userRecord && userRecord.email && userRecord.email.endsWith('@chinesepod.com'))
          }
        }, process.env.jwtSecret)
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

    
  }
    
}
