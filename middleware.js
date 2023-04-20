let axios = require('axios')

exports.checkAuth = async function(req, res, next){
    
    console.log(">>", req.originalUrl);
    let path = req.originalUrl.replace("v2", "v1")

    req.session.inputs = req.params

    if (req.params.userId) {
        req.session.userId = req.params.userId
    } else if (req.query.userId) {
        req.session.userId = req.query.userId 
    } else if (req.headers && req.headers.authorization) {
        let userDataToken = res.app.locals.helpers.extractToken(req)
        req.session.userId = userDataToken.userId
    } else if (req.session.userId) {
        req.session.userId = req.session.userId
    } else {
        req.session.userId = null
    }

    if (!req.session.token) {

        var token = req.headers.authorization.replace("Bearer ","")
        var jsonPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())

        if (token) {
            req.session.token = token
            req.session.userId= jsonPayload.data.userId
        }

    }

    if (req.query) {
        req.session.inputs = req.query
    }



    next()
}



