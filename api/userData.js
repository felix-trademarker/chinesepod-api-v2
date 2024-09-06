let userService = require('../services/userService')
let Users = require('../repositories/users')
let crmUsersMongoAws = require('../repositories/crmUsersMongoAWS')
let _ = require('lodash')
const crypto = require('crypto');

exports.fn = async function(req, res, next) {

  let userId = req.session.userId
  try{
    
    const encodedSid = 's%3AQ4mhwVOAw264XiyVZLHc8L7Gz5kjp2jr.dPwP0xJ%2B0dFQ%2Bt0VUgyHSVTR8s7aoopoO0bjP10RVhc';
    const decodedSid = decodeURIComponent(encodedSid);
    const [sessionId, signature] = decodedSid.slice(2).split('.');

    const crypto = require('crypto');

// Your session secret (this must match what the server uses)
const sessionSecret = '71e0aba070df4892e7384da1828fbfff';

// Recompute the HMAC signature
const hmac = crypto.createHmac('sha256', sessionSecret)
                   .update(sessionId)
                   .digest('base64')
                   .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    res.json(hmac);

    } catch (e) {
      console.log(e);
    }


  
} 
