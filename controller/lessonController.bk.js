let Lessons = require('../repositories/lessons')
let LessonsDialogue = require('../repositories/lessonDialogue')
let LessonsVocabulary = require('../repositories/lessonVocabulary')
let LessonsExpansion = require('../repositories/lessonExpansion')
let LessonSources = require('../repositories/lessonSources')
let LessonNewSources = require('../repositories/lessonNewSources')
let LessonFiles = require('../repositories/lessonFiles')
let LessonDownloads = require('../repositories/lessonDownloads')

var ModelRedis = require('../repositories/_modelRedis')
let redisClientLesson = new ModelRedis('lessons')
let redisClientDialogue = new ModelRedis('dialogue')
let redisClientVocab = new ModelRedis('vocab')
let redisClientExpansion = new ModelRedis('expansions')

let userService = require('../services/userService')

let _ = require('lodash')
const sanitizeHtml = require('sanitize-html')
const geoip = require('geoip-country')
let moment = require('moment')

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

  // console.log(await redisClientLesson.get(inputs.slug))

  if (!userId) {
    res.json({err:'Invalid'})
  } else {

    // UPDATE USERS IN MONGO158 
    userService.getUserStats(userId)

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

    let lesson = {}

    // GET REDIS LESSON DATA
    try{
      lesson = await redisClientLesson.get(inputs.slug)
    } catch(err) {
      console.log("==== Redis ERROR ====", err);
    }
    
    
    // CHECK AND UPDATE LESSON DATA WITH USERS RECORDS ABOUT THE LESSON
    if (lesson && lesson.id != '123') {
      let userLessons = await Lessons.getMysqlProduction(`Select v3_id, saved, studied, created_at as updatedAt 
                                    From user_contents 
                                    WHERE user_id=${userId} 
                                    AND v3_id='${lesson.id}'
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

      console.log(">>>>>>>>>>> Return lesson data from redis");

      // RETURN LESSON DATA FROM REDIS
      res.json(lesson)

    } else {
      // GET LESSON DATA IN MYSQL, UPDATE MONGO158 AND REDIS RECORDS
      let lessonData = {}
      let columns = res.app.locals.helpers.getLessonColumns()
      columns[0] = "v3_id as id"

      if (inputs.slug) {
        
        lessonData = (await Lessons.getMysqlProduction(`
          SELECT ${columns.join(',')}
          FROM contents 
          WHERE slug='${encodeURI(inputs.slug)}'
        `))[0]

      } else {

        lessonData = (await Lessons.getMysqlProduction(`
          SELECT ${columns.join(',')}
          FROM contents 
          WHERE v3_id='${encodeURI(inputs.lessonId)}'
        `))[0]
      }

      if (lessonData && lessonData.slug) {

        lesson = lessonData
        lesson.introduction = sanitizeHtml(lesson.introduction, sanitizeOptions)

        let userLessons = await Lessons.getMysqlProduction(`Select v3_id, saved, studied, created_at as updatedAt 
                                      From user_contents 
                                      WHERE user_id=${userId} 
                                      AND v3_id='${lesson.id}'
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
        if (lesson.image) {
          lesson.image = cleanLink(
            lessonData.image && lessonData.image.startsWith('http')
              ? lessonData.image
              : lessonRoot + lessonData.image
          )
        }
        // console.log("dialogue data", lessonData.mp3_dialogue);
        if (lessonData.mp3_dialogue) {
          if (lessonData.mp3_dialogue.endsWith('.mp3')) {
            lesson.mp3_dialogue = cleanLink(
              lessonData.mp3_dialogue && lessonData.mp3_dialogue.startsWith('http')
                ? lessonData.mp3_dialogue
                : lessonRoot + lessonData.mp3_dialogue
            )
          } else {
            lesson.mp3_dialogue = '';
          }
          
        }
        if (lessonData.mp3_public) {
          if (lessonData.mp3_public.endsWith('.mp3')) {
            lesson.mp3_public = cleanLink(
              lessonData.mp3_public && lessonData.mp3_public.startsWith('http')
                ? lessonData.mp3_public
                : lessonRoot + lessonData.mp3_public
            )
          } else {
            lesson.mp3_public = '';
          }
          
        }
        if (lessonData.mp3_private) {
          if (lessonData.mp3_private.endsWith('.mp3')) {
            lesson.mp3_private = cleanLink(
              lessonData.mp3_private && lessonData.mp3_private.startsWith('http')
                ? lessonData.mp3_private
                : lessonRoot + lessonData.mp3_private
            )
          } else {
            lesson.mp3_private = '';
          }
        }
        if (lessonData.mp3_thefix) {
          if (lessonData.mp3_thefix.endsWith('.mp3')) {
            lesson.mp3_thefix = cleanLink(
              lessonData.mp3_thefix && lessonData.mp3_thefix.startsWith('http')
                ? lessonData.mp3_thefix
                : lessonRoot + lessonData.mp3_thefix
            )
          } else {
            lesson.mp3_thefix = '';
          }
        }
        if (lessonData.pdf1) {
          if (lessonData.pdf1.endsWith('.pdf')) {
            lesson.pdf1 = cleanLink(
              lessonData.pdf1 && lessonData.pdf1.startsWith('http')
                ? lessonData.pdf1
                : lessonRoot + lessonData.pdf1
            )
          } else {
            lesson.pdf1 = '';
          }
        }
        if (lessonData.pdf2) {
          if (lessonData.pdf2.endsWith('.pdf')) {
            lesson.pdf2 = cleanLink(
              lessonData.pdf2 && lessonData.pdf2.startsWith('http')
                ? lessonData.pdf2
                : lessonRoot + lessonData.pdf2
            )
          } else {
            lesson.pdf2 = '';
          }
        }

        lesson.extra = lesson.type === 'extra'

        lesson.sources = (await LessonSources.findQuery({v3_id: lesson.id}))[0]

        if (lesson.sources || lesson.video) {
          // const access = await sails.helpers.users.getAccessType(inputs.userId)

          

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

        // UPDATE MONGO158 
        Lessons.upsert({id:lesson.id}, lesson);
        // UPDATE REDIS RECORDS
        await redisClientLesson.set(inputs.slug, JSON.stringify(lesson))

        res.json(lesson)
      } else {
        throw 'invalid'
      }
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

    // let dialogueRedisData = await redisClientDialogue.get(inputs.lessonId)
    let dialogueRedisData = {}
    try{
      dialogueRedisData = await redisClientDialogue.get(inputs.lessonId)
    } catch(err) {
      console.log("==== Redis ERROR Dialogue ====", err);
    }

    if (dialogueRedisData) {
      console.log(">>>>>>>>>>> Return dialogue data from redis");
      res.json( dialogueRedisData )

    } else {

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

      let returnedData = {
      speakers: speakers,
      dialogue: dialogueData,
      }

      Lessons.upsert({id:inputs.lessonId}, {dialogue: returnedData});
      await redisClientDialogue.set(inputs.lessonId, JSON.stringify(returnedData))

      res.json( returnedData )
    }

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

exports.getDownloads = async function(req, res, next) {
console.log('dl');

// THIS IS A TEST TO GET ALL PREMIUM USERS FOR SITE STATS
// ================ TEST START =================

// let users = await Lessons.getMysqlProduction(`
//   SELECT a.user_id, b.option_value as newDashboard, c.last_login
//   FROM user_site_links a
//   LEFT JOIN user_options b
//   ON a.user_id=b.user_id
//   LEFT JOIN user_preferences c
//   ON a.user_id=c.user_id
//    WHERE a.usertype_id <> 7 AND a.expiry > '${moment().format()}'
//    AND b.option_key = 'newDashboard'
// `)

// let countLastLogin=0
// await asyncForEach(users, async (user) => {

//   if (moment(user.newDashboard).diff(user.last_login) > 0) {
//     user.last_login = user.newDashboard
//   }

//   if ( moment().subtract(3, 'months').diff(user.last_login) < 0 ) {
//     // user.last3Months = true; 
//     countLastLogin++;
//   }

// })
// ================== END TEST ==================



// res.json({
//   total : users.length,
//   lastSeen3Months: countLastLogin,
//   users: users
// })


  // let response = await userService.getRequestAPI(req, res, next)
  let userId = req.session.userId
  let inputs = req.session.inputs

  let queryAddOn = []
  
  if (inputs && inputs.limit) {
    queryAddOn.push("LIMIT " + inputs.limit)
  }
  if (inputs && inputs.skip) {
    queryAddOn.push("OFFSET " + inputs.skip)
  }
  userId='925842'
  // console
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
    console.log(inputs.lessonId);
    let lessonData = await Lessons.getMysqlProduction(`SELECT * FROM contents WHERE v3_id='${encodeURI(inputs.lessonId)}'`)
    lessonData = lessonData[0]
    // console.log(lessonData[0])
    // let lessonData;
    // _.each(lessonDataArr, function (lesson) {
    //   console.log(lesson)
    // })
    let returnData = {
      type: access,
      downloads: {},
    }
    
    let lessonRoot = `https://s3.amazonaws.com/chinesepod.com/${
      lessonData.type === 'extra' ? 'extra/' : ''
    }${lessonData.v3_id}/${lessonData.hash_code}/`

    console.log(1);
    if (access === 'premium' || access === 'admin') {
      console.log(2);
      if (lessonData.video) {
        console.log(3);
        const awsSources = (
          await LessonFiles.findQuery({id:lessonData.v3_id}))[0]
          console.log(4);
        if (awsSources && awsSources['mp4Urls']) {
          returnData.downloads.video = awsSources['mp4Urls'][0]
        }
      }
      console.log(20);
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
      console.log("=============== here >>");
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
    console.log("=============== end here >>");
    // let saveData = response
    // saveData.lessonId = inputs.lessonId
    // console.log(saveData);
    // LessonDownloads.upsert({lessonId:inputs.lessonId}, saveData);

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

    // let lessonExpansion = await redisClientExpansion.get(inputs.lessonId)
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

      Lessons.upsert({id:inputs.lessonId}, {expansion: returnData});
      await redisClientExpansion.set(inputs.lessonId, JSON.stringify(returnData))

      res.json(returnData);
    }

    
  }
}

exports.getLessonURLNew = async function(req, res, next) {

  // let inputs = req.session.inputs
  let redisClientLessonVideos = new ModelRedis('lessonVideos')

  let lessonVideos = await redisClientLessonVideos.get(req.params.v3Id)

  if (lessonVideos) {

    res.json(lessonVideos)
    
  } else {

    let newHls = (await LessonNewSources.findQuery({v3_id:req.params.v3Id }))[0]
    await redisClientLessonVideos.set(req.params.v3Id, JSON.stringify(newHls))
  
    res.json(newHls)
  }

  // console.log(req.params.v3Id);
  // console.log(req.body);
  
}

exports.getComments = async function (req, res, next) {

  let userId = req.session.userId
  let inputs = req.session.inputs

  let lessonComments = await Lessons.getMysqlProduction(`select c.id, c.content, c.reply_to_id, c.reply_to_id_2, c.reply_to_user_id, c.comment_from, c.created_at,
  c.user_id, u.username, p.avatar_url
  from comments c
  left join users u on c.user_id=u.id
  left join user_preferences p on p.user_id=c.user_id
  where c.parent_id = '${inputs.lessonId}' and c.type = 'lesson'`)

  _.each(lessonComments, function (comment) {
    if (comment.reply_to_id && comment.reply_to_id > 0) {
      let parent = lessonComments.find((x) => x.id === comment.reply_to_id)
      if (parent) {
        if (!parent.nestedComments) {
          parent.nestedComments = []
        }
        parent.nestedComments.push(comment)
      }
    }
  })

  res.json( {
    count: lessonComments.length,
    comments: lessonComments
      .filter((comment) => comment.reply_to_user_id === 0)
      .sort((a, b) => b.created_at - a.created_at),
  })
}

exports.getGrammar = async function (req, res, next) {

  let userId = req.session.userId
  let inputs = req.session.inputs

  // const grammarIds = await ContentGrammarTag.find({ v3_id: inputs.lessonId })
  const grammarIds = await Lessons.getMysqlProduction(`
    SELECT * 
    FROM content_grammar_tag
    WHERE v3_id = '${inputs.lessonId}'
  `)
  console.log(grammarIds);
  let returnData = []

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

  res.json(returnData) 
}

exports.getExercises = async function (req, res, next) {

  const convert = require('xml-js')

  let inputs = req.session.inputs

  // let lessonQuestions = await Questions.find({
  //   scope: inputs.lessonId,
  //   product_id: 1,
  //   status: 1,
  // })

  let lessonQuestions = await Lessons.getMysqlAssessment(`
    Select * 
      From questions 
      WHERE scope = '${inputs.lessonId}' AND product_id=1 AND status=1`)

  // await asyncForEach(lessonQuestions, async (question) => {
  //   await QuestionsMongo.updateOrCreate({ id: question.id }, { ...question })
  // })

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

  res.json({
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
  })
}




