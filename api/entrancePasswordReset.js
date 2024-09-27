let Users = require('../repositories/users')
// let axios = require('axios')
const jwToken = require('jsonwebtoken');
let randomToken = require('rand-token');
var ModelRedis = require('../repositories/_modelRedis')
let redisClient = new ModelRedis('users.login')

var Model = require('./../repositories/_model158')
let userService = require('./../services/userService')

const mailgun = require('mailgun-js');

// Set up your Mailgun credentials
const DOMAIN = 'your_domain_name';  // e.g., sandbox12345.mailgun.org
const mg = mailgun({ apiKey: process.env.mailAPI, domain: process.env.mailDomain });

exports.fn = async function(req, res, next) {
  
  async function getToken(){
    let token = randomToken.uid(18)
    let findUser;
    do{

      findUser = (await Users.getMysqlProduction(`SELECT id FROM users WHERE code='${token}'`))[0];

    }while(!findUser)

    return token;
  }

  let inputs = req.body

  if (!inputs.emailAddress) {
    res.status(401).json({
      error: "Missing or Invalid parameters",
      code: "E_MISSING_OR_INVALID_PARAMS",
      message: "The server could not fulfill this request due to missing or invalid parameter."
    });
  }

  let userRecord;

  // FETCH FROM MONGO RECORDS
  try {
    userRecord = (await Users.findQuerySelected({
      email: emailAddress, name
    },{email:1, password: 1, id: 1, code: 1}))[0];
  } catch (err) {
    userRecord = (await Users.getMysqlProduction(`SELECT email, password, name, code, id FROM users WHERE email='${inputs.emailAddress}'`))[0];
  }

  // FETCH FROM MYSQL RECORDS
  if ( !userRecord ) {
    userRecord = (await Users.getMysqlProduction(`SELECT email, password, name, code, id FROM users WHERE email='${inputs.emailAddress}'`))[0];
  }

  if (!userRecord.code){
    userRecord.code = getToken()
    // update mysql and mongo
    Users.upsert({id: userRecord.id},{code:userRecord.code})
    let sqlQuery = `UPDATE users
    SET code = '${userRecord.code}'
    WHERE id=${userRecord.id}`;
    Users.getMysqlProduction(sqlQuery)
  }

  let passwordLink = "https://www.chinesepod.com/password/new?token="+userRecord.code
  // SEND EMAIL
  if (userRecord) {
    // Set up your email data
    let htmlContent = `
    <div style="background-color: #FAFAFA; width: 100%; font-family: 'Roboto', 'Arial', 'Helvetica Neue', 'Helvetica', sans-serif; box-sizing: border-box; padding-bottom: 25px; margin: 0;">
      <div style="background: transparent; padding-top: 30px; padding-bottom: 20px; text-align: center;">
        <img style="display: inline-block; height: 40px; width: auto; margin-left: auto; margin-right: auto;" alt="ChinesePod" src="https://s3contents.chinesepod.com/email/logo.png"/>
      </div>
      <div style="background-color: #fff; color: #000; font-size: 1em; border-top: 2px solid #ee1100; border-bottom: 1px solid #E6E6E6; box-sizing: border-box; padding: 25px; width: 100%; max-width: 600px; margin-left: auto; margin-right: auto;">
        <p style="margin-bottom: 25px;">Dear ${userRecord.name},</p>
        <p style="margin-bottom: 25px;">Someone requested a password reset for your account. If this was not you, please disregard this email. Otherwise, simply click the button below:</p>
        <div style="margin-bottom: 25px; text-align: center;">
          <a style="background-color: #2487C1; display: inline-block; font-size: 1.1em; color: #fff; padding: 10px 35px 10px; font-weight: 500; text-decoration: none; border-radius: 7px;" href="${passwordLink}">Update password</a>
        </div>
        <p style="margin-bottom: 25px;">If you have any trouble, try pasting this link in your browser: <a style="color: #2487C1; word-wrap: break-word;" href="${passwordLink}">${passwordLink}</a></p>
        <p style="margin-bottom: 5px;">Sincerely,</p>
        <p style="margin-top: 0px;">The ChinesePod Team</p>
      </div>
    </div>`;
    const data = {
      from: `${process.env.mailgFromName} <${process.env.mailgFromEmailAddress}>`,
      to: userRecord.email,
      subject: 'Password reset instructions',
      html: htmlContent
    };

    // Send the email
    mg.messages().send(data, (error, body) => {
      if (error) {
        console.log('Error:', error);
      } else {
        console.log('Email sent successfully:', body);
      }
    });

  } else {
    res.status(401).json({
      error: "Missing or Invalid parameters",
      code: "E_MISSING_OR_INVALID_PARAMS",
      message: "The server could not fulfill this request due to missing or invalid parameter."
    });
  }

    
}
