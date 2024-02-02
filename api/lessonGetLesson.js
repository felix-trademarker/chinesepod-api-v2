let Lessons = require('../repositories/lessons')
let LessonSources = require('../repositories/lessonSources')
var ModelRedis = require('../repositories/_modelRedis')
let redisClientLesson = new ModelRedis('lessons')
const sanitizeHtml = require('sanitize-html')

exports.fn = async function(req, res, next) {
  let userId = req.session.userId
  let inputs = req.session.inputs

  // userId='1197231'
  if (!userId) {
    res.json({err:'Invalid'})
  } else {

    // UPDATE USERS IN MONGO158 
    // userService.getUserStats(userId)

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
      
      // UPDATE MONGO158 
      Lessons.upsert({id:lesson.id}, lesson);

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