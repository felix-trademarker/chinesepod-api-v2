let Lessons = require('../repositories/lessons')
// var ModelRedis = require('../repositories/_modelRedis')
// let redisClient = new ModelRedis('exercises')
let _ = require('lodash')


exports.fn = async function(req, res, next) {
  const convert = require('xml-js')

  let inputs = req.session.inputs

  let redisData = {}
  // try{
  //   redisData = await redisClient.get(inputs.lessonId)
  // } catch(err) {
  //   console.log("==== Redis ERROR exercices ====", err);
  // }

  if (false && redisData) {
    console.log(">>>>>>>>>>> Return questions data from redis");
    res.json( redisData )

  } else {

    let lessonQuestions = await Lessons.getMysqlAssessment(`
      Select * 
        From questions 
        WHERE scope = '${inputs.lessonId}' AND product_id=1 AND status=1`)

    lessonQuestions.forEach((question) => {
      try {
        question.options = convert.xml2js(question.options, {
          compact: true,
          ignoreAttributes: true,
        })
        question.options_2 = convert.xml2js(question.options_2, {
          compact: true,
          ignoreAttributes: true,
        })
        question.options_3 = convert.xml2js(question.options_3, {
          compact: true,
          ignoreAttributes: true,
        })

        // sails.log.info(question)

        switch (question.type_id) {
          case 4:
            question.question = {
              audio: question.options.type_d.data.prototype_mp3_url['_text'],
            }
            question.answer = {
              s: question.options.type_d.data.prototype['_text'],
              t: question.options_2.type_d.data.prototype['_text'],
              p: question.options_3.type_d.data.prototype['_text'],
              e: question.options.type_d.data.english['_text'],
            }
            break
          case 2:
            question.question = { segments: [] }
            question.options.type_b.data.section.forEach((segment, index) => {
              question.question.segments.push({
                s: segment.prototype['_text'],
                t:
                  question.options_2.type_b.data.section[index].prototype[
                    '_text'
                  ],
                p:
                  question.options_3.type_b.data.section[index].prototype[
                    '_text'
                  ],
                e: segment.english['_text'],
                id: parseInt(segment.tag['_text']),
              })
            })
            break
          case 1:
            question.question = { segments: [] }
            question.options.type_a_options.data.section.forEach(
              (phrase, index) => {
                question.question.segments.push({
                  id: parseInt(phrase.tag['_text']),
                  s: phrase.prototype['_text'],
                  t:
                    question.options_2.type_a_options.data.section[index]
                      .prototype['_text'],
                  p:
                    question.options_3.type_a_options.data.section[index]
                      .prototype['_text'],
                  e: phrase.english['_text'],
                })
              }
            )
            break
          case 5:
            question.question = {
              s: question.title,
              t: question.title_2,
              p: question.title_3,
              choices: [],
            }
            question.answer = {
              id: parseInt(question.options.type_e.data.answer['_text']),
              s: question.options.type_e.data.sentence_translation['_text'],
              t: question.options_2.type_e.data.sentence_translation['_text'],
              p: question.options_3.type_e.data.sentence_translation['_text'],
              e: question.options.type_e.data.sentence_english['_text'],
            }

            // sails.log.info(question.options.type_e.data)

            question.options.type_e.data.options.forEach((choice, index) => {
              question.question.choices.push({
                id: parseInt(choice.tag['_text']),
                s: choice.prototype['_text'],
                t:
                  question.options_2.type_e.data.options[index].prototype[
                    '_text'
                  ],
                p:
                  question.options_3.type_e.data.options[index].prototype[
                    '_text'
                  ],
                e: choice.english['_text'],
              })
            })
            break
        }
      } catch (e) {
        // sails.log.error(e)
        // sails.hooks.bugsnag.notify(e)
      }
    })
    lessonQuestions = lessonQuestions.map((question) => {
      return _.pick(question, [
        'id',
        'scope',
        'score',
        'type_id',
        'status',
        'question',
        'answer',
        'createdAt',
      ])
    })

    let returnedData = {
      matching: lessonQuestions.filter((question) => {
        return question.type_id === 1
      }),
      audio: lessonQuestions.filter((question) => {
        return question.type_id === 4
      }),
      choice: lessonQuestions.filter((question) => {
        return question.type_id === 5
      }),
      rearrange: lessonQuestions.filter((question) => {
        return question.type_id === 2
      }),
    }

    Lessons.upsert({id:inputs.lessonId}, {exercises: returnedData});
    // await redisClient.set(inputs.lessonId, JSON.stringify(returnedData))

    res.json(returnedData)
  }
}