let axios = require('axios')

exports.checkAuth = async function(req, res, next){
    
    let path = req.originalUrl.replace("v2", "v1")
    console.log('checking',path);

    if (req.params.userId) {
        req.session.userId = req.params.userId
    } else if (req.headers && req.headers.authorization) {
        let userDataToken = res.app.locals.helpers.extractToken(req)
        req.session.userId = userDataToken.userId
    } else if (req.session.userId) {
        req.session.userId = req.session.userId
    } else {
        req.session.userId = null
    }

    if (!req.session.token) {
        var options = {
            'headers': {
              'Cookie': req.headers.cookie
            }
          };
          let url = 'https://www.chinesepod.com/api/v1/entrance/get-user'
        
          let currentUser = await axios.get(url,options)
          req.session.token = currentUser.data.token
          req.session.userId= currentUser.data.userId
    }

    next()
}

exports.getCurrentUser = async function(req, res, next){
    
    // let currentUser = await fetch('https://www.chinesepod.com/api/v1/entrance/get-user')
    let currentUser = await axios.get('https://www.chinesepod.com/api/v1/entrance/get-user')

}


