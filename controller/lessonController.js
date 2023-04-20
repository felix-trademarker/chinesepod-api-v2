let Lessons = require('../repositories/lessons')
let LessonsDialogue = require('../repositories/lessonDialogue')
let LessonsVocabulary = require('../repositories/lessonVocabulary')
let LessonsExpansion = require('../repositories/lessonExpansion')
let LessonSources = require('../repositories/lessonSources')
let LessonFiles = require('../repositories/lessonFiles')


let userService = require('../services/userService')

let _ = require('lodash')
const sanitizeHtml = require('sanitize-html')
const geoip = require('geoip-country')


const { asyncForEach } = require('../frequent')

exports.getDetails = async function(req, res, next) {

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

    let lessonData;
    if (inputs.id) {
      lessonData = await LessonData
        .findOne(inputs.id)
        .select(['title', 'image', 'level', 'type', 'hash_code', 'introduction', 'publication_timestamp', 'hosts']);
    } else {
      lessonData = await LessonData
        .findOne({slug: encodeURI(inputs.slug)})
        .select(['title', 'image', 'level', 'type', 'hash_code', 'introduction', 'publication_timestamp', 'hosts']);
    }

    if (!lessonData) {
      throw 'invalid'
    }

    const convert = require('pinyin-tone-converter');

    const sanitizeHtml = require('sanitize-html');

    const sanitizeOptions = {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'image'],
      allowedAttributes: {
        a: [ 'href', 'name', 'target'],
        image: ['src', 'alt', 'width', 'height'],
      }
    };

    let lessonRoot = `https://s3contents.chinesepod.com/${lessonData.type === 'extra' ? 'extra/' : ''}${lessonData.id}/${lessonData.hash_code}/`

    lessonData.introduction = sanitizeHtml(lessonData.introduction, sanitizeOptions);
    lessonData.image = lessonData.image && lessonData.image.slice(0,4) === 'http' ? lessonData.image : lessonRoot + lessonData.image;

    lessonData.image.replace('http:', 'https:');
    lessonData.image.replace('https://s3.amazonaws.com/chinesepod.com/', 'https://s3contents.chinesepod.com/');

    const keyMap = {
      column_1: 's',
      column_2: 'p',
      column_3: 'en',
      column_4: 't'
    };

    let vocab = await Vocabulary.find({
      v3_id: lessonData.id,
      vocabulary_class: {
        in: ['Key Vocabulary', 'Supplementary']
      }
    })
      .sort([
        {vocabulary_class: 'ASC'},
        {display_order: 'ASC'}
      ]).limit(4);
    let vocabData = [];
    _.each(vocab, function (item) {
      item['simplified'] = item.column_1;
      item['pinyin'] = convert.convertPinyinTones(item.column_2);
      item['english'] = item.column_3;
      item['traditional'] = item.column_4;
      item['audioUrl'] = lessonRoot + item.audio
      vocabData.push(_.pick(item, ['simplified', 'traditional', 'pinyin', 'english', 'audioUrl']));
    });

    let rawDialogues = await ContentDialogues.find({v3_id: lessonData.id})
      .sort('display_order ASC').limit(4);

    let dialogueData = [];
    let speakers = [];

    rawDialogues.forEach((dialogue) => {
      if (dialogue.speaker) {
        speakers.push(dialogue.speaker);
      }
      dialogue.vocabulary = [];
      dialogue.sentence = [];
      dialogue.english = dialogue.row_2;
      dialogue.pinyin = '';
      dialogue.simplified = '';
      dialogue.traditional = '';
      dialogue['row_1'].replace(/\(event,\'(.*?)\',\'(.*?)\',\'(.*?)\',\'(.*?)\'.*?\>(.*?)\<\/span\>([^\<]+)?/g, function(A, B, C, D, E, F, G, H) {

        let d = ''; let e = ''; let c = ''; let b = ''; let g = '';

        try {d = decodeURI(D)} catch (err) {
          d = D;
          sails.log.error(err)
        }
        try {e = decodeURI(E)} catch (err) {
          e = E;
          sails.log.error(err)
        }
        try {c = decodeURI(C)} catch (err) {
          c = C;
          sails.log.error(err)
        }
        try {b = decodeURI(B)} catch (err) {
          b = B;
          sails.log.error(err)
        }

        dialogue.pinyin += c + ' ';
        dialogue.simplified += d;
        dialogue.traditional += e;

        if (G) {
          try {g = decodeURI(G)} catch (err) {
            g = G;
            sails.log.error(err)
          }
          dialogue.sentence.push(g);
          dialogue.pinyin += g;
          dialogue.simplified += g;
          dialogue.traditional += g;
        }
      });
      dialogue['audioUrl'] = lessonRoot + dialogue.audio
      dialogue.pinyin = convert.convertPinyinTones(dialogue.pinyin);
      dialogueData.push(_.pick(dialogue, ['audioUrl', 'english', 'pinyin', 'traditional', 'simplified']))
    });

    return {
      lessonTitle: lessonData.title,
      lessonInfo: lessonData,
      vocabulary: vocabData,
      dialogue: dialogueData,
      expansion: []
    }
  }

}


exports.getLesson = async function(req, res, next) {
  let userId = req.session.userId
  let inputs = req.session.inputs

  if (!userId) {
    res.json({err:'Invalid'})
  } else {

    const cleanLink = (link) => {
      if (!link) {
        return ''
      }
      link = link.replace('http:', 'https:')
      link = link.replace(
        'https://s3.amazonaws.com/chinesepod.com/',
        'https://s3contents.chinesepod.com/'
      )
      return link
    }

    const sanitizeOptions = {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'image'],
      allowedAttributes: {
        a: ['href', 'name', 'target'],
        image: ['src', 'alt', 'width', 'height'],
      },
    }

    if (!inputs.slug && !inputs.lessonId) {
      throw 'invalid'
    }

    let lessonData = {}
    let columns = res.app.locals.helpers.getLessonColumns()
    columns[0] = "v3_id as id"

    if (inputs.slug) {
      
      lessonData = (await Lessons.getMysqlProduction(`
        SELECT ${columns.join(',')}
        FROM contents 
        WHERE slug='${encodeURI(inputs.slug)}'
      `))[0]
      // if (inputs.comments) {
      //   lessonData = await LessonData.findOne({
      //     slug: encodeURI(inputs.slug),
      //   }).populate('comments', { where: { type: 'lesson' } })
      // } else {
      //   lessonData = await LessonData.findOne({ slug: encodeURI(inputs.slug) })
      // }
    } else {
      // lessonData = await LessonData.findOne({
      //   id: inputs.lessonId,
      // }).populate('comments', { where: { type: 'lesson' } })
      lessonData = (await Lessons.getMysqlProduction(`
        SELECT ${columns.join(',')}
        FROM contents 
        WHERE v3_id='${encodeURI(inputs.lessonId)}'
      `))[0]
    }

    if (lessonData && lessonData.slug) {

      // try {
      //   await LessonDataMongo.updateOrCreate(
      //     { id: lessonData.id },
      //     { ...lessonData }
      //   )
      // } catch (e) {
      //   sails.hooks.bugsnag.notify(e)
      // }

      let lesson = lessonData
      lesson.introduction = sanitizeHtml(lesson.introduction, sanitizeOptions)
      // console.log(lesson)
      // let userLessons = await UserContents.find({
      //   where: {
      //     lesson: lessonData.id,
      //     user_id: inputs.userId,
      //     lesson_type: 0,
      //   },
      //   select: ['lesson', 'saved', 'studied', 'updatedAt'], //  'title', 'slug', 'image', 'hash_code', 'publication_timestamp'
      //   sort: 'updatedAt DESC',
      //   limit: inputs.limit ? inputs.limit : 10,
      // })
      let userLessons = await Lessons.getMysqlProduction(`Select v3_id, saved, studied, created_at as updatedAt 
                                    From user_contents 
                                    WHERE user_id=${userId} 
                                    AND v3_id=${lesson.id}
                                    ORDER BY created_at DESC
                                    LIMIT ${inputs.limit ? inputs.limit : 10}
                                `); 

      if (userLessons[0]) {
        lesson.studied = userLessons[0].studied ? userLessons[0].studied : false
        lesson.saved = userLessons[0].saved ? userLessons[0].saved : false
      } else {
        lesson.studied = false
        lesson.saved = false
      }

      let lessonRoot = `https://s3contents.chinesepod.com/${
        lessonData.type === 'extra' ? 'extra/' : ''
      }${lessonData.id}/${lessonData.hash_code}/`
      if (lessonData.image) {
        lessonData.image = cleanLink(
          lessonData.image && lessonData.image.startsWith('http')
            ? lessonData.image
            : lessonRoot + lessonData.image
        )
      }
      if (lessonData.mp3_dialogue) {
        lessonData.mp3_dialogue = cleanLink(
          lessonData.mp3_dialogue && lessonData.mp3_dialogue.startsWith('http')
            ? lessonData.mp3_dialogue
            : lessonRoot + lessonData.mp3_dialogue
        )
      }
      if (lessonData.mp3_public) {
        lessonData.mp3_public = cleanLink(
          lessonData.mp3_public && lessonData.mp3_public.startsWith('http')
            ? lessonData.mp3_public
            : lessonRoot + lessonData.mp3_public
        )
      }
      if (lessonData.mp3_private) {
        lessonData.mp3_private = cleanLink(
          lessonData.mp3_private && lessonData.mp3_private.startsWith('http')
            ? lessonData.mp3_private
            : lessonRoot + lessonData.mp3_private
        )
      }
      if (lessonData.mp3_thefix) {
        lessonData.mp3_thefix = cleanLink(
          lessonData.mp3_thefix && lessonData.mp3_thefix.startsWith('http')
            ? lessonData.mp3_thefix
            : lessonRoot + lessonData.mp3_thefix
        )
      }
      if (lessonData.pdf1) {
        lessonData.pdf1 = cleanLink(
          lessonData.pdf1 && lessonData.pdf1.startsWith('http')
            ? lessonData.pdf1
            : lessonRoot + lessonData.pdf1
        )
      }
      if (lessonData.pdf2) {
        lessonData.pdf2 = cleanLink(
          lessonData.pdf2 && lessonData.pdf2.startsWith('http')
            ? lessonData.pdf2
            : lessonRoot + lessonData.pdf2
        )
      }

      lesson.extra = lesson.type === 'extra'

      lesson.sources = (await LessonSources.findQuery({v3_id: lesson.id}))[0]

      if (lesson.sources || lesson.video) {
        // const access = await sails.helpers.users.getAccessType(inputs.userId)

        let accessInfo = await userService.getAccessTypeAndExpiry(userId)

        let access = accessInfo.type

        const geo = geoip.lookup(req.ip)

        if (!lesson.sources) {
          lesson.sources = { wistia: {} }
        }

        if (lesson.sources && lesson.sources.wistia && lesson.video) {
          lesson.sources.wistia.simplified = lesson.video
        }

        try {
          if (lesson.video && lesson.sources) {

            // TODO: FIND RECORDS IN DYNAMODB
            // CREATE REPOSITORIES LESSONFILES

            // console.log("this", test);
            const assets = (
              await LessonFiles.findQuery({id:lesson.id})
            )[0]
              
            console.log(assets)
            if (assets && assets.srcVideo) {
              lesson.sources['hls'] = { simplified: assets.srcVideo }
              // lesson.sources['mp4'] = { simplified: assets.mp4Urls }
            }
          }
        } catch (e) {
          console.log(e)
          // sails.hooks.bugsnag.notify(e)
          // sails.log.error(e)
        }

        if (
          (!geo || geo.country !== 'CN') &&
          access === 'free' &&
          (lesson.sources.youtube || lesson.sources.vimeo)
        ) {
          delete lesson.sources.wistia
          delete lesson.sources.hls
          // delete lesson.sources.mp4
        }
      }

      res.json(lesson)
    } else {
      throw 'invalid'
    }
    
  }
}

exports.getDialogue = async function(req, res, next) {

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

    // let rawDialogues = await ContentDialogues.find({
    //   v3_id: inputs.lessonId,
    // }).sort('display_order ASC')

    let rawDialogues = await Lessons.getMysqlProduction(`
                        SELECT *
                        FROM content_dialogues 
                        WHERE v3_id='${inputs.lessonId}'
                        ORDER BY display_order ASC
                      `)

    let dialogueData = []
    let speakers = []
    //
    // sails.log.info(rawDialogues)

    await asyncForEach(rawDialogues, async (dialogue) => {
      
      LessonsDialogue.upsert({id:dialogue.id}, dialogue);

      if (dialogue.speaker) {
        speakers.push(dialogue.speaker)
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

    res.json( {
      speakers: speakers,
      dialogue: dialogueData,
    })
    
  }
}

exports.getVocab = async function(req, res, next) {
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

    res.json(returnData.map((item) =>
      _.pick(item, ['id', 's', 't', 'p', 'en', 'audio', 'vocabulary_class'])
    ))
  }
}

exports.getDownloads = async function(req, res, next) {
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

    const cleanLink = (link) => {
      if (!link) {
        return ''
      }
      link = link.replace('http:', 'https:')
      return link
    }

    // let access = await sails.helpers.users.getAccessType(inputs.userId)

    let accessInfo = await userService.getAccessTypeAndExpiry(userId)
    let access = accessInfo.type

    let user = await userService.getUser(userId)

    if (
      user &&
      user.email &&
      user.email.split('@')[1] === 'chinesepod.com'
    ) {
      access = 'premium'
    }

    let lessonData = (await Lessons.getMysqlProduction(`
                        SELECT *
                        FROM contents 
                        WHERE v3_id='${inputs.lessonId}'
                      `))[0]

    let returnData = {
      type: access,
      downloads: {},
    }

    let lessonRoot = `https://s3.amazonaws.com/chinesepod.com/${
      lessonData.type === 'extra' ? 'extra/' : ''
    }${lessonData.id}/${lessonData.hash_code}/`

    if (access === 'premium' || access === 'admin') {
      if (lessonData.video) {
        const awsSources = (
          await LessonFiles.find('srcVideo', lessonData.video + '.mp4'))[0]
        
        if (awsSources && awsSources['mp4Urls']) {
          returnData.downloads.video = awsSources['mp4Urls'][0]
        }
      }
      if (lessonData.mp3_private) {
        returnData.downloads.lesson = cleanLink(
          lessonData.mp3_private && lessonData.mp3_private.startsWith('http')
            ? lessonData.mp3_private
            : lessonRoot + lessonData.mp3_private
        )
      }
      if (lessonData.mp3_dialogue) {
        returnData.downloads.dialogue = cleanLink(
          lessonData.mp3_dialogue && lessonData.mp3_dialogue.startsWith('http')
            ? lessonData.mp3_dialogue
            : lessonRoot + lessonData.mp3_dialogue
        )
      }
      if (lessonData.mp3_thefix) {
        returnData.downloads.review = cleanLink(
          lessonData.mp3_thefix && lessonData.mp3_thefix.startsWith('http')
            ? lessonData.mp3_thefix
            : lessonRoot + lessonData.mp3_thefix
        )
      }
      if (lessonData.pdf1) {
        returnData.downloads.pdf1 = cleanLink(
          lessonData.pdf1 && lessonData.pdf1.startsWith('http')
            ? lessonData.pdf1
            : lessonRoot + lessonData.pdf1
        )
      }
      if (lessonData.pdf2) {
        returnData.downloads.pdf2 = cleanLink(
          lessonData.pdf2 && lessonData.pdf2.startsWith('http')
            ? lessonData.pdf2
            : lessonRoot + lessonData.pdf2
        )
      }
    } else if (access === 'basic') {
      if (lessonData.pdf1) {
        returnData.downloads.pdf1 = cleanLink(
          lessonData.pdf1 && lessonData.pdf1.startsWith('http')
            ? lessonData.pdf1
            : lessonRoot + lessonData.pdf1
        )
      }
      if (lessonData.pdf2) {
        returnData.downloads.pdf2 = cleanLink(
          lessonData.pdf2 && lessonData.pdf2.startsWith('http')
            ? lessonData.pdf2
            : lessonRoot + lessonData.pdf2
        )
      }
    }

    res.json(returnData);
  }
}

exports.getExpansion = async function(req, res, next) {
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

    const groupBy = (key) => (array) =>
      array.reduce((objectsByKeyValue, obj) => {
        const value = obj[key]
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj)
        return objectsByKeyValue
      }, {})

    const groupByVocab = groupBy('vocabulary')

    // All done.

    let rawExpansions = await LessonsExpansion.getMysqlProduction(`
                          SELECT vocabulary, row_1, row_2, audio
                          FROM content_expansions 
                          WHERE v3_id='${inputs.lessonId}'
                          ORDER BY display_order ASC
                        `)

    await asyncForEach(rawExpansions, async (expansion) => {

      LessonsExpansion.upsert({id: expansion.id}, {...expansion});

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
    res.json(returnData);
  }
}





