var express = require('express');
var userController = require('../controller/userController')
var middleware = require('../middleware')

var router = express.Router();

// middleware.getCurrentUser()

// router.get('/entrance/get-user', userController.getUser);

// router.get('/dashboard/get-info', userController.getInfo);
router.get('/dashboard/get-info/:userId', userController.getInfo);

// router.get('/dashboard/get-stats', userController.getStats);
router.get('/dashboard/get-stats/:userId', userController.getStats);

// router.get('/account/subscription/subscriptions', userController.getSubscriptions);
router.get('/account/subscription/subscriptions/:userId', userController.getSubscriptions);

// BASED ON LIVE API
// router.get('/recap/get-popular-recap-lessons', userController.popularRecapLessons);

 
// DYNAMIC ROUTE TO CATCH ALL FORWARDED API
router.get('/*', userController.serveAPI);
router.post('/*', userController.serveAPI);
router.put('/*', userController.serveAPI);
router.delete('/*', userController.serveAPI);


module.exports = router;