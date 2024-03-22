let Lessons = require('../repositories/lessons')
var ModelRedis = require('../repositories/_modelRedis')
let redisClientExpansion = new ModelRedis('expansions')
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

    let lessonExpansion = {}
    try{
      lessonExpansion = await redisClientExpansion.get(inputs.lessonId)
    } catch(err) {
      console.log("==== Redis ERROR Vocab ====", err);
    }

    if (lessonExpansion) {

      console.log(">>>>>>>>>>> Return Expansion data from redis");
      res.json(lessonExpansion);

    } else {
      const groupBy = (key) => (array) =>
        array.reduce((objectsByKeyValue, obj) => {
          const value = obj[key]
          objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj)
          return objectsByKeyValue
        }, {})

      const groupByVocab = groupBy('vocabulary')

      let rawExpansions = await Lessons.getMysqlProduction(`
                            SELECT vocabulary, row_1, row_2, audio
                            FROM content_expansions 
                            WHERE v3_id='${inputs.lessonId}'
                            ORDER BY display_order ASC
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

      await asyncForEach(rawExpansions, async (expansion) => {

        // LessonsExpansion.upsert({id: expansion.id}, {...expansion});
        if (!expansion.audio.startsWith('http')){
          expansion.audio = audioRoot + expansion.audio
        }

        expansion.sentence = []
        expansion['target'] = expansion['row_2']
        expansion['en'] = expansion['row_2']
        expansion.p = ''
        expansion.s = ''
        expansion.t = ''
        expansion['row_1'].replace(
          /\(event,\'(.*?)\',\'(.*?)\',\'(.*?)\',\'(.*?)\'.*?\>(.*?)\<\/span\>([^\<]+)?/g,
          function (A, B, C, D, E, F, G, H) {
            let d = ''
            let e = ''
            let c = ''
            let b = ''
            let g = ''

            try {
              d = decodeURI(D)
            } catch (err) {
              d = D
            }
            try {
              e = decodeURI(E)
            } catch (err) {
              e = E
            }
            try {
              c = decodeURI(C)
            } catch (err) {
              c = C
            }
            try {
              b = decodeURI(B)
            } catch (err) {
              b = B
            }

            expansion.sentence.push({
              s: d,
              t: e,
              p: c,
              en: b,
            })

            expansion.p += c + ' '
            expansion.s += d
            expansion.t += e

            if (G) {
              try {
                g = decodeURI(G)
              } catch (err) {
                g = G
              }
              expansion.sentence.push(g)
              expansion.p += g
              expansion.s += g
              expansion.t += g
            }
          }
        )

        delete expansion['row_1']
        delete expansion['row_2']
      })
      let groupedData = groupByVocab(rawExpansions)
      let returnData = []
      Object.keys(groupedData).forEach((expansion) => {
        returnData.push({
          phrase: expansion,
          examples: groupedData[expansion],
        })
      })

      Lessons.upsert({id:inputs.lessonId}, {expansion: returnData});
      await redisClientExpansion.set(inputs.lessonId, JSON.stringify(returnData))

      res.json(returnData);
    }

    
  }
}