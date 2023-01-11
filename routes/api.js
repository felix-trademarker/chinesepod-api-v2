var express = require('express');
var userController = require('../controller/userController')
var middleware = require('../middleware')

var router = express.Router();

// middleware.getCurrentUser()

router.get('/entrance/get-user', userController.getUser);

router.get('/dashboard/get-info', userController.getInfo);


module.exports = router;