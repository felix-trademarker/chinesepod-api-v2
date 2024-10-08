/**
 * API: /1.0.0/instances/prod/lessons/get-lesson-detail
 * METHOD : GET
 * PARAMETERS: sessionid, v3_id
 * EX: /1.0.0/instances/prod/lessons/get-lesson-detail?sessionid=f205c92bc11d8d997b78baacaadeb599c1fa0163cc8c64e8c58e53761204bfdb0638&v3_id=6000&custom_error=1
 * 
**/

exports.fn = async function(req, res) {

  const parsedUrl = new URL("https://server4.chinesepod.com"+req.url);
  const params = Object.fromEntries(parsedUrl.searchParams.entries());
  const m158 = req.m158

  try{
     
    let v3_id = params.v3_id || '',
        sessionid = params.sessionid || '';

    let phpSession = (await m158.db("chinesepod").collection("user.sessions").find ({session_id: sessionid}).toArray ())[0]
    
    let user=null;
    if (phpSession) user = (await m158.db("chinesepod").collection("users").find ({email: phpSession.session_user_id}).toArray ())[0]
    
    const query = { v3_id: v3_id };

    let lesson = (await m158.db("chinesepod").collection("legacy.cp.prod.contents").find (query).toArray ())[0];
    
    if (!lesson) {
      return null;
    }

    let lessonV1 = (await m158.db("chinesepod").collection("lessons").find ({id:v3_id}).toArray ())[0];
    let contentSeries = (await m158.db("chinesepod").collection("legacy.cp.prod.contents_series").find ({id:lesson.series_id}).toArray ())[0];
    let comments = await m158.db("chinesepod").collection("legacy.cp.prod.comments").find ({parent_id:lesson.v3_id}).project({id:1}).toArray ();

    lesson.name = contentSeries ? contentSeries.name : '';
    lesson.series_name = contentSeries ? contentSeries.name : '';
    lesson.comment_count = comments ? comments.length : 0;

    // console.log("fetching content tags")
    // get topics
    // let contentToContentTags = await m158.db("chinesepod")
    //   .collection("legacy.cp.prod.content_tags")
    //   .aggregate([
    //     // {
    //     //   $match: { v3_id: lesson.v3_id }
    //     // },
    //     {
    //       $lookup: {
    //         from: 'legacy.cp.prod.contents_to_content_tags',
    //         localField: 'id',
    //         foreignField: 'tag_id',
    //         as: 'topics'
    //       }
    //     },
    //     {
    //       $unwind: '$topics'
    //     },
    //     {
    //       $match: { 'topics.v3_id': lesson.v3_id }
    //     },
    //     {
    //       $project: { 'tag': 1, _id: 0 }
    //     }
    //   ])
    //   .toArray();
    let contentToContentTags = await m158.db("chinesepod")
      .collection("legacy.cp.prod.contents_to_content_tags")
      .find({v3_id: lesson.v3_id, type: 'topic'})
      .project({tag_id: 1, _id: 0})
      .toArray();
    // Get only the tag_id values
    const tagIds = contentToContentTags.map(tag => tag.tag_id);

    let topics = await m158.db("chinesepod")
      .collection("legacy.cp.prod.content_tags")
      .find({id: {$in: tagIds}})
      .project({tag: 1, _id: 0})
      .toArray();

      // console.log("------fetched------",topics)

    lesson.topics = topics.map(topic => topic.tag);

    let freeLessons = await m158.db("chinesepod").collection("legacy.cp.prod.contents_free").find (query).toArray ();

      
    let lessonRoot = `https://s3contents.chinesepod.com/${lesson.type === 'extra' ? 'extra/' : ''}${lesson.v3_id}/${lesson.hash_code}/`;

    if (lesson.image) {
      lesson.image = res.helpers.cleanLink(
        lesson.image && lesson.image.startsWith('http')
          ? lesson.image
          : lessonRoot + lesson.image
      )
    }

    if (lesson.mp3_dialogue) {
      if (lesson.mp3_dialogue.endsWith('.mp3')) {
        lesson.mp3_dialogue = res.helpers.cleanLink(
          lesson.mp3_dialogue && lesson.mp3_dialogue.startsWith('http')
            ? lesson.mp3_dialogue
            : lessonRoot + lesson.mp3_dialogue
        )
      } else {
        lesson.mp3_dialogue = '';
      }

    }
    if (lesson.mp3_public) {
      if (lesson.mp3_public.endsWith('.mp3')) {
        lesson.mp3_public = res.helpers.cleanLink(
          lesson.mp3_public && lesson.mp3_public.startsWith('http')
            ? lesson.mp3_public
            : lessonRoot + lesson.mp3_public
        )
      } else {
        lesson.mp3_public = '';
      }
      lesson.radio_quality_mp3 = lesson.mp3_public

    }
    if (lesson.mp3_private) {
      if (lesson.mp3_private.endsWith('.mp3')) {
        lesson.mp3_private = res.helpers.cleanLink(
          lesson.mp3_private && lesson.mp3_private.startsWith('http')
            ? lesson.mp3_private
            : lessonRoot + lesson.mp3_private
        )
      } else {
        lesson.mp3_private = '';
      }
      lesson.high_quality_mp3 = lesson.mp3_private
      delete lesson.mp3_private
    }
    if (lesson.mp3_thefix) {
      if (lesson.mp3_thefix.endsWith('.mp3')) {
        lesson.mp3_thefix = res.helpers.cleanLink(
          lesson.mp3_thefix && lesson.mp3_thefix.startsWith('http')
            ? lesson.mp3_thefix
            : lessonRoot + lesson.mp3_thefix
        )
      } else {
        lesson.mp3_thefix = '';
      }
    }

    // if (lessons[l].sources) {
    //   lessons[l].video = lessons[l].sources.hls.simplified
    //   delete lessons[l].sources
    // }

    // identify if this lesson is saved and studied
    let lessonUserContents;
    if (user && user.userContents)
    lessonUserContents = (user.userContents.filter((value, index, self) =>
      self.findIndex(v => v.v3_id === lesson.v3_id) === index
    ))[0]
    // console.log(lessonUserContents);
    if (lessonUserContents) {
      lesson.studied = lessonUserContents.studied ? 1 : 0
      lesson.bookmarked = lessonUserContents.status == "Bookmarked" ? 1 : 0
    } else {
      lesson.studied = 0
      lesson.bookmarked = 0
    }

    // check if lesson belongs to free content
    let isFree = (freeLessons.filter((value, index, self) =>
      self.findIndex(v => v.v3_id === lessons[l].id) === index
    ))[0]

    if (isFree) {
      lesson.free = 1
    } else {
      lesson.free = 0
    }

    lesson.introduction = res.helpers.sanitizeHTML(lesson.introduction);
    // lesson.topics = '';
    lesson.comment_count = '';
    lesson.video_url = lessonV1.sources && lessons[l].sources.hls ? lessonV1.sources.hls.simplified : '';



    let returnData = {}
    if (lesson) {
      returnData.success = 1;
      returnData.data = lesson
    } else {
      returnData.success = 0;
      returnData.data = null
    }

    // TODO
    // create function to add lesson with new structure
    // don't wait for the function to finish, return actual actual lesson Data
    let newLessonData = { 
      id: lessonV1.id,
      hash_code: lessonV1.hash_code, 
      type: lessonV1.type, 
      title: lessonV1.title, 
      slug: lessonV1.slug, 
      image: lessonV1.image, 
      introduction: lessonV1.introduction, 
      mp3_dialogue: lessonV1.mp3_dialogue, 
      mp3_thefix: lessonV1.mp3_thefix, 
      mp3_private: lessonV1.mp3_private, 
      mp3_public: lessonV1.mp3_public, 
      level: lessonV1.level, 
      publication_timestamp: lessonV1.publication_timestamp,
      dialogue: lessonV1.dialogue,
      expansion: lessonV1.expansion,
      grammar: lessonV1.grammar,
      vocabulary: lessonV1.vocabulary,
      topics: lesson.topics
    };

    newLessonData.sources = []
    if (lessonV1.sources && lessonV1.sources.hls) {
      newLessonData.sources.push(lessonV1.sources.hls.simplified)
      newLessonData.sources.push(lessonV1.sources.hls.simplified.replace("https://d2arcxjkuir81y.cloudfront.net/","https://oss.chinesepod.com/"))
    }
    
    // https://d2arcxjkuir81y.cloudfront.net/
    // https://oss.chinesepod.com/

    // DONT WAIT FOR THE FUNCTION TO FINISH
    m158.db("chinesepod").collection("lessons.v2").updateOne({id:newLessonData.id},{$set: newLessonData },{upsert:true}, 
      function(err, result) {
      
      if (err) {
        console.log("Failed to save lesson data", newLessonData.id)
      } else {
        console.log("Successfully saved lesson data", newLessonData.id)
      }
      
    });


    return returnData
  } catch (error) {
    console.error('Error in GET API:', error);
  }
};