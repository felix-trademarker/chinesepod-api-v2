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

    // REWRITE FUNCTION

    
  }
}

exports.getDownloads = async function(req, res, next) {
  // NEEDS REWRITE
  
}

exports.getExpansion = async function(req, res, next) {
  // NEEDS REWRITE
}

exports.getComments = async function(req, res, next) {
  // NEEDS REWRITE
}

exports.getExercises = async function(req, res, next) {
  // NEEDS REWRITE
}

exports.getGrammar = async function(req, res, next) {
  // NEEDS REWRITE
}

exports.getLessonURLNew = async function(req, res, next) {

  // let inputs = req.session.inputs
  let redisClientLessonVideos = new ModelRedis('lessonVideos')

  let lessonVideos = await redisClientLessonVideos.get(req.params.v3Id)

  if (lessonVideos) {

    res.json(lessonVideos)
    
  } else {

    let newHls = (await LessonNewSources.findQuery({v3_id:req.params.v3Id }))[0]
    await redisClientExpansion.set(req.params.v3Id, JSON.stringify(newHls))
  
    res.json(newHls)
  }

  // console.log(req.params.v3Id);
  // console.log(req.body);
  
}





