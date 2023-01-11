let axios = require('axios')

exports.checkAuth = async function(req, res, next){
    
    
}

exports.getCurrentUser = async function(req, res, next){
    
    // let currentUser = await fetch('https://www.chinesepod.com/api/v1/entrance/get-user')
    let currentUser = await axios.get('https://www.chinesepod.com/api/v1/entrance/get-user')

}


