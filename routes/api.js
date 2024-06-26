var express = require('express');
var dashboardController = require('../controller/dashboardController')
var labelController = require('../controller/labelController')
var lessonController = require('../controller/lessonController')
var vocabularyController = require('../controller/vocabularyController')

var router = express.Router();

// 

// router.get('/dashboard/get-info', dashboardController.getInfo);
// router.get('/dashboard/get-stats', dashboardController.getStats);
// router.get('/dashboard/course-lessons', dashboardController.courseLessons);
// router.get('/dashboard/user-courses', dashboardController.userCourses);
// router.get('/dashboard/history', dashboardController.history);
// router.get('/dashboard/bookmarks', dashboardController.bookmarks);

// router.get('/dashboard/more-courses', dashboardController.moreCourses);
// router.get('/dashboard/all-lessons', dashboardController.allLessons);
// router.get('/dashboard/get-bookmarked-lessons', dashboardController.getBookMarkedLessons);

// router.get('/dashboard/get-studied-lessons', dashboardController.getStudiedLessons);
// router.get('/dashboard/all-courses', dashboardController.allCourses);
// router.get('/dashboard/all-playlists', dashboardController.allPlaylists);
// router.get('/dashboard/onboarding/questions', dashboardController.onboardingQuestions);

// router.get('/dashboard/get-suggestions', dashboardController.getSuggestions);
// router.get('/dashboard/get-course', dashboardController.getCourse);
// router.get('/dashboard/get-all-lessons', dashboardController.getAllLessons);

// router.get('/lessons/get-dialogue', lessonController.getDialogue);
// router.get('/lessons/get-expansion', lessonController.getExpansion);
// router.get('/lessons/get-vocab', lessonController.getVocab);
// router.get('/lessons/get-details/:id', lessonController.getDetails);
// router.get('/lessons/get-lesson/', lessonController.getLesson);
// router.get('/lessons/get-downloads', lessonController.getDownloads);
// router.get('/lessons/get-comments', lessonController.getComments);
// router.get('/lessons/get-grammar', lessonController.getGrammar);

// router.get('/exercises/get-questions', lessonController.getExercises);

// router.get('/vocabulary/decks', vocabularyController.getAllDecks);


// router.get('/account/subscription/subscriptions', dashboardController.getSubscriptions);

// router.get('/labels/gift-packages', labelController.giftPackages);

// CUSTOM API
// router.get('/user/confirm-email', dashboardController.setEmailConfirm);
// router.get('/user/subscriptions', dashboardController.getUserSubscription);

// BASED ON LIVE API
// router.get('/recap/get-popular-recap-lessons', userController.popularRecapLessons);

 
// DYNAMIC ROUTE TO CATCH ALL FORWARDED API
// router.get('/*', userController.serveAPI);
// router.post('/*', userController.serveAPI);
// router.put('/*', userController.serveAPI);
// router.delete('/*', userController.serveAPI);


module.exports = router;