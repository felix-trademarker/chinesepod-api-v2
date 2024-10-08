/**
 * API: /1.0.0/instances/prod/lessons/get-latest-lessons 
 * METHOD : GET
 * PARAMETERS: count, page, sessionid
 * EX: /1.0.0/instances/prod/lessons/get-latest-lessons?count=1&page=2&sessionid=ea63379bebe07f765f1125d791af4e17b01d1c552b6ee7eb9b4e1354c391285a244f
 * 
**/

exports.fn = async function(req, res) {

  const parsedUrl = new URL("https://server4.chinesepod.com"+req.url);
  const params = Object.fromEntries(parsedUrl.searchParams.entries());
  const m158 = req.m158

  try{
     
    let page = params.page || 1, 
        count = params.count || 20,
        sessionid = params.sessionid || '';

        page *= 1
        count *= 1

    let phpSession = (await m158.db("chinesepod").collection("user.sessions").find ({session_id: sessionid}).toArray ())[0]
    
    let user=null;
    if (phpSession) user = (await m158.db("chinesepod").collection("users").find ({email: phpSession.session_user_id}).toArray ())[0]

    const projection = { 
                        id: 1,
                        title: 1, 
                        hash_code: 1, 
                        type: 1, 
                        title: 1, 
                        image: 1, 
                        video: 1, 
                        introduction: 1, 
                        mp3_dialogue: 1, 
                        mp3_thefix: 1, 
                        mp3_private: 1, 
                        mp3_public: 1, 
                        level: 1, 
                        sources: 1,
                        _id: 0 
                      };
    let lessons = await m158.db("chinesepod").collection("lessons").find ().skip((page-1) * count).limit(count).sort({publication_timestamp: -1}).project(projection).toArray ();
    let freeLessons = await m158.db("chinesepod").collection("legacy.cp.prod.contents_free").find ().toArray ();

    for (let l=0; l < lessons.length; l++) {
      
      let lessonRoot = `https://s3contents.chinesepod.com/${lessons[l].type === 'extra' ? 'extra/' : ''}${lessons[l].id}/${lessons[l].hash_code}/`;

      if (lessons[l].image) {
        lessons[l].image = res.helpers.cleanLink(
          lessons[l].image && lessons[l].image.startsWith('http')
            ? lessons[l].image
            : lessonRoot + lessons[l].image
        )
      }

      if (lessons[l].mp3_dialogue) {
        if (lessons[l].mp3_dialogue.endsWith('.mp3')) {
          lessons[l].mp3_dialogue = res.helpers.cleanLink(
            lessons[l].mp3_dialogue && lessons[l].mp3_dialogue.startsWith('http')
              ? lessons[l].mp3_dialogue
              : lessonRoot + lessons[l].mp3_dialogue
          )
        } else {
          lessons[l].mp3_dialogue = '';
        }

      }
      if (lessons[l].mp3_public) {
        if (lessons[l].mp3_public.endsWith('.mp3')) {
          lessons[l].mp3_public = res.helpers.cleanLink(
            lessons[l].mp3_public && lessons[l].mp3_public.startsWith('http')
              ? lessons[l].mp3_public
              : lessonRoot + lessons[l].mp3_public
          )
        } else {
          lessons[l].mp3_public = '';
        }
        lessons[l].radio_quality_mp3 = lessons[l].mp3_public
        delete lessons[l].mp3_public
      }
      if (lessons[l].mp3_private) {
        if (lessons[l].mp3_private.endsWith('.mp3')) {
          lessons[l].mp3_private = res.helpers.cleanLink(
            lessons[l].mp3_private && lessons[l].mp3_private.startsWith('http')
              ? lessons[l].mp3_private
              : lessonRoot + lessons[l].mp3_private
          )
        } else {
          lessons[l].mp3_private = '';
        }
        lessons[l].high_quality_mp3 = lessons[l].mp3_private
        delete lessons[l].mp3_private
      }
      if (lessons[l].mp3_thefix) {
        if (lessons[l].mp3_thefix.endsWith('.mp3')) {
          lessons[l].mp3_thefix = res.helpers.cleanLink(
            lessons[l].mp3_thefix && lessons[l].mp3_thefix.startsWith('http')
              ? lessons[l].mp3_thefix
              : lessonRoot + lessons[l].mp3_thefix
          )
        } else {
          lessons[l].mp3_thefix = '';
        }
      }

      if (lessons[l].sources && lessons[l].sources.hls) {
        lessons[l].video = lessons[l].sources.hls.simplified
        delete lessons[l].sources
      }

      // identify if this lesson is saved and studied
      let lessonUserContents;
      if (user && user.userContents)
      lessonUserContents = (user.userContents.filter((value, index, self) =>
        self.findIndex(v => v.v3_id === lessons[l].id) === index
      ))[0]
      // console.log(lessonUserContents);
      if (lessonUserContents) {
        lessons[l].studied = user.userContents ? 1 : 0
        lessons[l].saved = user.userContents ? 1 : 0
      } else {
        lessons[l].studied = 0
        lessons[l].saved = 0
      }

      // check if lesson belongs to free content
      let isFree = (freeLessons.filter((value, index, self) =>
        self.findIndex(v => v.v3_id === lessons[l].id) === index
      ))[0]

      if (isFree) {
        lessons[l].free = 1
      } else {
        lessons[l].free = 0
      }

      lessons[l].extra = lessons[l].type === 'extra'
      lessons[l].introduction = lessons[l].introduction ? res.helpers.sanitizeHTML(lessons[l].introduction) : lessons[l].introduction;
      lessons[l].v3_id = lessons[l].id 

      delete lessons[l].id 
      delete lessons[l].hash_code 


    }


    let returnData = {}
    if (lessons) {
      returnData.success = 1;
      returnData.data = lessons
    } else {
      returnData.success = 0;
      returnData.data = null
    }

    return returnData
  } catch (error) {
    console.error('Error in GET API:', error);
  }
};