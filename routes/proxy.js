var express = require('express');
var proxyController = require('../controller/proxyController')

var router = express.Router();


// BASED ON LIVE API
// router.get('/recap/get-popular-recap-lessons', userController.popularRecapLessons);

 
// DYNAMIC ROUTE TO CATCH ALL FORWARDED API
router.get('/*', proxyController.serveAPI);
// router.post('/*', userController.serveAPI);
// router.put('/*', userController.serveAPI);
// router.delete('/*', userController.serveAPI);


module.exports = router;