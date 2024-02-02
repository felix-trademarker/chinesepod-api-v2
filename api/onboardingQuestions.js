let userService = require('../services/userService')
let Users = require('../repositories/users')



exports.fn = async function(req, res, next) {
    
  let userId = req.session.userId
  let inputs = req.session.inputs
  
  const questions = require('../lib/onboarding.json')
  // userId= "1197231"
  if (!userId) {
    res.json({err:'Invalid'})
  } else {
    let userOptions = await Users.getMysqlProduction(`
      SELECT * 
      FROM user_options 
      WHERE user_id=${userId}
    `)
    let userOptionsArr = {}
    for (let i=0; i < userOptions.length; i++) { 
      let entry = userOptions[i]
      userOptionsArr[entry.option_key] = entry.option_value
    }

    let toAsk = []

    questions.forEach((question) => {
      if (!userOptionsArr[question.key]) {
        toAsk.push(question)
      }
    })

    res.json({
      completeness: (questions.length - toAsk.length) / questions.length,
      questions: toAsk,
    })

  }
  
} 
