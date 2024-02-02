let LessonsVocabulary = require('../repositories/lessonVocabulary')

let userService = require('../services/userService')

let _ = require('lodash')
const sanitizeHtml = require('sanitize-html')
const geoip = require('geoip-country')


const { asyncForEach } = require('../frequent')


exports.fn = async function(req, res, next) {

  let userId = req.session.userId

  if (!userId) {
    res.json({})
    // userId = 1197231
  }
  // console.log(res.app.locals.moment().format('YYYY-MM-DD hh:mm:ss'));
  let userDecks = await LessonsVocabulary.getMysqlProduction(`
    Select * From vocabulary_tags Where user_id='${userId}'
    `)
  // console.log(1)
    let promises = []
    let returnData = []
    userDecks.forEach((deck) => {
      promises.push(
        new Promise(async (resolve) => {
          let uvtvQuery = `Select user_vocabulary_id  From user_vocabulary_to_vocabulary_tags Where vocabulary_tag_id=${deck.id}`
          // let deckContents = await UserVocabularyToVocabularyTags.find({
          //   vocabulary_tag_id: deck.id,
          // }).select('user_vocabulary_id')
          let deckContents = await LessonsVocabulary.getMysqlProduction(uvtvQuery)
          // console.log(2)
          let forReview = (await LessonsVocabulary.getMysqlProduction(`
            Select COUNT(*) as total from user_vocabulary Where id in ('${deckContents.map((i) => i.user_vocabulary_id).join("','")}') and last_correct_date <= '${res.app.locals.moment().format('YYYY-MM-DD hh:mm:ss')}'
            `))[0]

            // console.log(deckContents.map((i) => i.user_vocabulary_id).join("','"));
          // let forReview = await UserVocabulary.count({
          //   id: {
          //     in: deckContents.map((i) => i.user_vocabulary_id),
          //   },
          //   next_test_date: { '<=': new Date() },
          // })
          returnData.push({
            ...deck,
            ...{
              count: deckContents.length,
              forReview: forReview.total,
            },
          })
          resolve()
        })
      )
    })
    // console.log(3)
    await Promise.all(promises)
    // console.log(4)
    returnData.sort((a, b) => b.id - a.id)

    res.json(returnData)
  
}





