var express = require('express');
var lessonController = require('../controller/lessonController')

var router = express.Router();


// get new lesson URL
router.get('/lessons/get-lesson-url/:v3Id', lessonController.getLessonURLNew);




module.exports = router;