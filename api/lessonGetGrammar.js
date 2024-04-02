let Lessons = require('../repositories/lessons')
var ModelRedis = require('../repositories/_modelRedis')
let redisClientGrammar = new ModelRedis('grammar')
let _ = require('lodash')
const { asyncForEach } = require('../frequent')
let NewV3Id = require('../repositories/newV3Id')

exports.fn = async function(req, res, next) {
  let userId = req.session.userId
  let inputs = req.session.inputs

  let lessonGrammar = {}
  // try{
  //   lessonGrammar = await redisClientGrammar.get(inputs.lessonId)
  // } catch(err) {
  //   console.log("==== Redis ERROR Vocab ====", err);
  // }

  if (false && lessonGrammar) {

    console.log(">>>>>>>>>>> Return Grammar data from redis");
    res.json(lessonGrammar);

  } else {

    const grammarIds = await Lessons.getMysqlProduction(`
      SELECT * 
      FROM content_grammar_tag
      WHERE v3_id = '${inputs.lessonId}'
    `)
    // console.log(grammarIds);
    let returnData = []

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

    await asyncForEach(grammarIds, async (item) => {

      let grammarBlocks = await Lessons.getMysqlProduction(`
        SELECT *
        FROM grammar_block
        WHERE grammar_id = ${item.grammar_id}
      `)

      await asyncForEach(grammarBlocks, async (block) => {
        // GET EXAMPLES AND GRAMMAR
        block['examples'] = await Lessons.getMysqlProduction(`
          select *
          from grammar_sentence 
          where grammar_block_id = ${block.grammar_block_id}
        `)

        block['grammar'] = await Lessons.getMysqlProduction(`
          select *
          from grammar_detail 
          where grammar_id = '${item.grammar_id}'
        `)

        let exampledata=[]
        // console.log(block['examples'])
        block['examples'].forEach((example) => {
          example.sentence = []

          example['en'] = example['target']

          example.p = ''
          example.s = ''
          example.t = ''

          example['source_annotate'].replace(
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

              example.sentence.push({
                s: d,
                t: e,
                p: c,
                en: b,
              })

              example.p += c + ' '
              example.s += d
              example.t += e

              if (G) {
                try {
                  g = decodeURI(G)
                } catch (err) {
                  g = G
                }
                example.sentence.push(g)
                example.p += g
                example.s += g
                example.t += g
              }
            }
          )

          if (newV3ID) {
            example.source_audio = audioRoot + example.source_audio
          }

          exampledata.push({
            audio: example.source_audio,
            en: example.en,
            p: example.p,
            s: example.s,
            t: example.t,
            target: example.target,
            sentence: example.sentence
          })
        })
        // FORMAT DATA TO SYNC WITH OLD API
        let dataObj = {
          examples: exampledata,
          grammar: {
            id: block.grammar[0].grammar_id,
            introduction: block.grammar[0].introduction,
            name: block.grammar[0].name,
            tree: block.grammar[0].tree,
            createdAt: block.grammar[0].update_time,
          },
          updatedAt: block.grammar[0].update_time
        }
        returnData.push(dataObj)
      })
    })

    Lessons.upsert({id:inputs.lessonId}, {grammar: returnData});
    // await redisClientGrammar.set(inputs.lessonId, JSON.stringify(returnData))

    res.json(returnData) 
  }
}