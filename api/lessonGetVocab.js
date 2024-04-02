let Lessons = require('../repositories/lessons')
let LessonsVocabulary = require('../repositories/lessonVocabulary')
// var ModelRedis = require('../repositories/_modelRedis')
// let redisClientVocab = new ModelRedis('vocab')
let _ = require('lodash')
const { asyncForEach } = require('../frequent')
let NewV3Id = require('../repositories/newV3Id')

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
    // try{
    //   lessonVocab = await redisClientVocab.get(inputs.lessonId)
    // } catch(err) {
    //   console.log("==== Redis ERROR Vocab ====", err);
    // }
    if (false && lessonVocab){

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


      let newV3ID = (await NewV3Id.findQuery({v3_id_new:inputs.lessonId}))[0]
      let audioRoot = ""

      let lessonData = {}
      if (newV3ID) {
        // get lesson and set audio
        lessonData = (await Lessons.getMysqlProduction(`
          SELECT hash_code, type
          FROM contents 
          WHERE v3_id='${inputs.lessonId}'
        `))[0]

        // build audio link
        audioRoot = `https://s3contents.chinesepod.com/${
          lessonData.type === 'extra' ? 'extra/' : ''
        }${newV3ID.v3_id}/${lessonData.hash_code}/`

      }

      let returnData = []
      _.each(vocab, function (item) {
      item['s'] = item.column_1
      item['p'] = item.column_2
      item['en'] = item.column_3
      item['t'] = item.column_4

      if (!item.audio.startsWith('http')){
        item.audio = audioRoot + item.audio
      }

      returnData.push(item)
      })

      await asyncForEach(returnData, async (word) => {
      await LessonsVocabulary.upsert({ id: word.id }, { ...word, lesson: word['v3_id'] })
      })

      let returnedData = returnData.map((item) =>
              _.pick(item, ['id', 's', 't', 'p', 'en', 'audio', 'vocabulary_class'])
            );

      Lessons.upsert({id:inputs.lessonId}, {vocabulary: returnedData});
      // await redisClientVocab.set(inputs.lessonId, JSON.stringify(returnedData))

      res.json(returnedData)
    }

    
  }
}