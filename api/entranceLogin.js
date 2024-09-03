let Users = require('../repositories/users')
let _ = require('lodash')
let userService = require('../services/userService')

exports.fn = async function(req, res, next) {
  
  let randomToken = require('rand-token');

    let inputs = req.body
    // console.log(req.params, req.body)
    // Look up by the email address.
    // (note that we lowercase it to ensure the lookup is always case-insensitive,
    // regardless of which database we're using)
    var userRecord = (await Users.findQuery({
      email: inputs.emailAddress.toLowerCase(),
    }))[0];

    console.log({userRecord: userRecord});

    // If there was no matching user, respond thru the "badCombo" exit.
    if(!userRecord) {
      sails.log.warn(`badCombo - ${this.req.ip} - ${inputs.emailAddress} - ${this.req.headers['user-agent']}`);
      throw 'badCombo';
    }

    // // If the password doesn't match, then also exit thru "badCombo".
    // await sails.helpers.passwords.checkPassword(inputs.password, userRecord.password)
    // .intercept('incorrect', 'badCombo');

    const submittedPass = res.app.locals.helpers.passwordHash(inputs);
    console.log(submittedPass)
    if (submittedPass !== userRecord.password){
      // sails.log.warn(`badCombo - ${this.req.ip} - ${inputs.emailAddress} - ${this.req.headers['user-agent']}`);
      // throw 'badCombo';
    }

    // If "Remember Me" was enabled, then keep the session alive for
    // a longer amount of time.  (This causes an updated "Set Cookie"
    // response header to be sent as the result of this request -- thus
    // we must be dealing with a traditional HTTP request in order for
    // this to work.)
    if (inputs.rememberMe) {
      if (this.req.isSocket) {
        // sails.log.warn(
        //   'Received `rememberMe: true` from a virtual request, but it was ignored\n'+
        //   'because a browser\'s session cookie cannot be reset over sockets.\n'+
        //   'Please use a traditional HTTP request instead.'
        // );
      } else {
        req.session.cookie.maxAge = sails.config.custom.rememberMeCookieMaxAge;
      }
    }

    // Modify the active session instance.
    // (This will be persisted when the response is sent.)
    this.req.session.userId = userRecord.id;

    delete this.req.session.limitedAuth;

    if (!this.req.wantsJSON) {
      await sails.helpers.createPhpSession.with({
        userId: userRecord.id,
        // sessionId: this.req.session.id
      })
        .then((phpSessionId) => {

          if (sails.config.environment !== 'production' || sails.config.environment === 'staging') {
          } else {
            this.res.cookie('CPODSESSID', phpSessionId, {
              domain: '.chinesepod.com',
              expires: new Date(Date.now() + 365.25 * 24 * 60 * 60 * 1000)
            });
          }
        });
    } else if (inputs.clientId) {
      const refreshToken = randomToken.uid(128);

      await RefreshTokens.create({
        user_id: userRecord.id,
        refresh_token: refreshToken,
        expiry: new Date(Date.now() + sails.config.custom.jwtRefreshExpiry),
        client_id: inputs.clientId,
        ip_address: this.req.ip,
        user_agent: this.req.headers['user-agent']
      })

      return {
        token: jwToken.sign({userId: userRecord.id, isTeam: (userRecord && userRecord.email && userRecord.email.endsWith('@chinesepod.com'))}),
        refreshToken: refreshToken
      };
    }
    
}