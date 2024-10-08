
exports.fn = async function(req, res) {

  try{
    
    res.json([{
      "id":"1",
      "user_id":"929593",
      "slug":"[{\"slug\":\"https://server4.chinesepod.com:444/1.0.0/medias/images/06bcc9f715--yt-advert-1200x335-1.jpg\",\"href\":\"https://href.lc/cpyoutube\"},{\"slug\":\"https://server4.chinesepod.com:444/1.0.0/medias/images/e87fe0fc2f--blog-advert1200x335.jpg\",\"href\":\"https://href.lc/cpblog\"}]",
      "title":"Slider Home page",
      "description":"1366x768",
      "status":"1",
      "created":"2017-07-18 23:29:50",
      "modified":"2017-11-15 01:16:00"
    }])

  } catch (error) {
    console.error('Error in GET API:', error);
  }
};