let Lessons = require('../repositories/lessons')
// var ModelRedis = require('../repositories/_modelRedis')
let userService = require('../services/userService')
let LessonFiles = require('../repositories/lessonFiles')


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
  // userId='925842'
  // let testData = await Lessons.getMysqlProduction(`SELECT u.id, u.email, ul.expiry 
  //                                                 FROM users u 
  //                                                 LEFT JOIN user_site_links ul
  //                                                 ON u.id = ul.user_id
  //                                                 WHERE u.country LIKE 'Iran%'
  //                                                 ORDER by ul.expiry DESC`)


  // res.json(testData)
  // console
  if (!userId) {
    res.json({err:'Invalid'})
  } else {

    const cleanLink = (link) => {
      if (!link) {
        return ''
      }
      link = link.replace('http:', 'https:')

      link = link.endsWith('/') ? '' :  link

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

    let lessonData = await Lessons.getMysqlProduction(`SELECT * FROM contents WHERE v3_id='${encodeURI(inputs.lessonId)}'`)
    lessonData = lessonData[0]

    let returnData = {
      type: access,
      downloads: {},
    }
    
    let lessonRoot = `https://s3.amazonaws.com/chinesepod.com/${
      lessonData.type === 'extra' ? 'extra/' : ''
    }${lessonData.v3_id}/${lessonData.hash_code}/`


    if (access === 'premium' || access === 'admin') {

      if (lessonData.video) {

        const awsSources = (
          await LessonFiles.findQuery({id:lessonData.v3_id}))[0]

        if (awsSources && awsSources['mp4Urls']) {
          returnData.downloads.video = awsSources['mp4Urls'][0]
        }

        if (!returnData.downloads.video) {
          delete returnData.downloads.video
        }
      }

      if (lessonData.mp3_private) {
        returnData.downloads.lesson = cleanLink(
          lessonData.mp3_private && lessonData.mp3_private.startsWith('http')
            ? lessonData.mp3_private
            : lessonRoot + lessonData.mp3_private
        )

        if (!returnData.downloads.lesson) {
          delete returnData.downloads.lesson
        }
      }
      if (lessonData.mp3_dialogue) {
        returnData.downloads.dialogue = cleanLink(
          lessonData.mp3_dialogue && lessonData.mp3_dialogue.startsWith('http')
            ? lessonData.mp3_dialogue
            : lessonRoot + lessonData.mp3_dialogue
        )

        if (!returnData.downloads.dialogue) {
          delete returnData.downloads.dialogue
        }
      }

      if (lessonData.mp3_thefix) {
        returnData.downloads.review = cleanLink(
          lessonData.mp3_thefix && lessonData.mp3_thefix.startsWith('http')
            ? lessonData.mp3_thefix
            : lessonRoot + lessonData.mp3_thefix
        )

        if (!returnData.downloads.review) {
          delete returnData.downloads.review
        }
      }
      if (lessonData.pdf1) {
        returnData.downloads.pdf1 = cleanLink(
          lessonData.pdf1 && lessonData.pdf1.startsWith('http')
            ? lessonData.pdf1
            : lessonRoot + lessonData.pdf1
        )

        if (!returnData.downloads.pdf1) {
          delete returnData.downloads.pdf1
        }
      }
      if (lessonData.pdf2) {
        returnData.downloads.pdf2 = cleanLink(
          lessonData.pdf2 && lessonData.pdf2.startsWith('http')
            ? lessonData.pdf2
            : lessonRoot + lessonData.pdf2
        )

        if (!returnData.downloads.pdf2) {
          delete returnData.downloads.pdf2
        }
      }
    } else if (access === 'basic') {
      if (lessonData.pdf1) {
        returnData.downloads.pdf1 = cleanLink(
          lessonData.pdf1 && lessonData.pdf1.startsWith('http')
            ? lessonData.pdf1
            : lessonRoot + lessonData.pdf1
        )

        if (!returnData.downloads.pdf1) {
          delete returnData.downloads.pdf1
        }
      }
      if (lessonData.pdf2) {
        returnData.downloads.pdf2 = cleanLink(
          lessonData.pdf2 && lessonData.pdf2.startsWith('http')
            ? lessonData.pdf2
            : lessonRoot + lessonData.pdf2
        )

        if (!returnData.downloads.pdf2) {
          delete returnData.downloads.pdf2
        }
      }
    }

    res.json(returnData);
  }
}
