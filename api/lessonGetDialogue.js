let Lessons = require('../repositories/lessons')
var ModelRedis = require('../repositories/_modelRedis')
let redisClientDialogue = new ModelRedis('dialogue')
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

    // let dialogueRedisData = await redisClientDialogue.get(inputs.lessonId)
    let dialogueRedisData = {}
    try{
      dialogueRedisData = await redisClientDialogue.get(inputs.lessonId)
      console.log(">>>>>>>>>>> Return dialogue data from redis");
    } catch(err) {
      console.log("==== Redis ERROR Dialogue ====", err);
    }

    // GET MONGO158 LESSON DATA
    if (!dialogueRedisData)
    try{
      let selectedFields = {
        dialogue: 1
      }
      lesson = await Lessons.findQuerySelected({id:inputs.lessonId},selectedFields)
      console.log(">>>>>>>>>>> Return lesson data from mongo158");
    } catch(err) {
      console.log("==== Mongo ERROR SKIPPED ====");
    }

    if (dialogueRedisData) {
      
      res.json( dialogueRedisData )

    } else {

      let rawDialogues = await Lessons.getMysqlProduction(`
            SELECT *
            FROM content_dialogues 
            WHERE v3_id='${inputs.lessonId}'
            ORDER BY display_order ASC
          `)

      // get lesson data old v3_id
      let newV3ID = (await NewV3Id.findQuery({v3_id_new:inputs.lessonId}))[0]
      let audioRoot = ""

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

      let dialogueData = []
      let speakers = []
      //
      // sails.log.info(rawDialogues)

      await asyncForEach(rawDialogues, async (dialogue) => {

        if (dialogue.speaker) {
          speakers.push(dialogue.speaker)
        }
        // check if audio link not starting with http
        if (!dialogue.audio.startsWith('http')){
          dialogue.audio = audioRoot + dialogue.audio
        }

        dialogue.vocabulary = []
        dialogue.sentence = []
        dialogue.en = dialogue.row_2
        dialogue.p = ''
        dialogue.s = ''
        dialogue.t = ''
        dialogue['row_1'].replace(
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

            dialogue.sentence.push({
            s: d,
            t: e,
            p: c,
            en: b,
            })

            dialogue.p += c + ' '
            dialogue.s += d
            dialogue.t += e

            if (G) {
            try {
            g = decodeURI(G)
            } catch (err) {
            g = G
            }
            dialogue.sentence.push(g)
            dialogue.p += g
            dialogue.s += g
            dialogue.t += g
            }

            dialogue.vocabulary.push({
            s: d ? d : '',
            t: e ? e : '',
            p: c ? c : '',
            en: b ? b : '',
            })
          }
        )
        dialogueData.push(
        _.pick(dialogue, [
        'display_order',
        'speaker',
        'row_2',
        'audio',
        'v3_id',
        'vocabulary',
        'sentence',
        'en',
        'p',
        't',
        's',
        ])
        )
      })

      dialogueData.e = dialogueData.row_2

      let returnedData = {
      speakers: speakers,
      dialogue: dialogueData,
      }

      Lessons.upsert({id:inputs.lessonId}, {dialogue: returnedData});
      // await redisClientDialogue.set(inputs.lessonId, JSON.stringify(returnedData))

      res.json( returnedData )
    }

  }
}