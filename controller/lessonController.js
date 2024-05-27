let LessonNewSources = require('../repositories/lessonNewSources')
let Users = require('../repositories/users')
let LessonFiles = require('../repositories/lessonFiles')

exports.getLessonURLNew = async function(req, res, next) {

  let newHls = (await LessonNewSources.findQuery({v3_id:req.params.v3Id }))[0]
    // await redisClientLessonVideos.set(req.params.v3Id, JSON.stringify(newHls))
  // add dl file
  const awsSources = (
    await LessonFiles.findQuery({id:req.params.v3Id}))[0]

  if (awsSources && awsSources['mp4Urls']) {
    newHls.src_mp4 = awsSources['mp4Urls'][0]
  }
  res.json(newHls)
  
}


exports.getUsersSiteUsageStat = async function(req, res, next) {

  let oldSite = await Users.findQuerySelected({newSiteUsed:false}, {id: 1, access: 1});
  let newSite = await Users.findQuerySelected({newSiteUsed:true}, {id: 1, access: 1});

  let oldPremium = oldSite.filter((element) => element.access == 'premium');
  let newPremium = newSite.filter((element) => element.access == 'premium');

  let returnedData = {
    oldSiteUsers: oldSite.length,
    oldSitePremiumUsers: oldPremium.length, 
    newSiteUsers: newSite.length,
    newSitePremiumUsers: newPremium.length, 
  }
  res.json(returnedData);
  
}

