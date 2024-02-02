let Lessons = require('../repositories/lessons')
let LessonsVocabulary = require('../repositories/lessonVocabulary')
var ModelRedis = require('../repositories/_modelRedis')
let redisClientVocab = new ModelRedis('vocab')
let _ = require('lodash')
const { asyncForEach } = require('../frequent')


exports.fn = async function(req, res, next) {
  let userId = req.session.userId
  let inputs = req.session.inputs

  let queryAddOn = []
  
  if (inputs && inputs.limit) {
    queryAddOn.push("LIMIT " + inputs.limit)
  }
  if (inputs && inputs.skip) {
    queryAddOn.push("OFFSET " + inputs.skip)
  }
  

  if (!userId) {
    res.json({err:'Invalid'})
  } else {

    // let lessonVocab = await redisClientVocab.get(inputs.lessonId)
    let lessonVocab = {}
    try{
      lessonVocab = await redisClientVocab.get(inputs.lessonId)
    } catch(err) {
      console.log("==== Redis ERROR Vocab ====", err);
    }
    if (lessonVocab){

      console.log(">>>>>>>>>>> Return Vocab data from redis");
      res.json(lessonVocab)

    } else {

      let vocab = await LessonsVocabulary.getMysqlProduction(`
            SELECT *
            FROM vocabulary 
            WHERE v3_id='${inputs.lessonId}'
            AND vocabulary_class in ('Key Vocabulary', 'Supplementary')
            ORDER BY vocabulary_class, display_order ASC
          `)


      let returnData = []
      _.each(vocab, function (item) {
      item['s'] = item.column_1
      item['p'] = item.column_2
      item['en'] = item.column_3
      item['t'] = item.column_4
      returnData.push(item)
      })

      await asyncForEach(returnData, async (word) => {
      await LessonsVocabulary.upsert({ id: word.id }, { ...word, lesson: word['v3_id'] })
      })

      let returnedData = returnData.map((item) =>
              _.pick(item, ['id', 's', 't', 'p', 'en', 'audio', 'vocabulary_class'])
            );

      Lessons.upsert({id:inputs.lessonId}, {vocabulary: returnedData});
      await redisClientVocab.set(inputs.lessonId, JSON.stringify(returnedData))

      res.json(returnedData)
    }

    
  }
}