const _ = require("lodash");  
let axios = require('axios');
const https = require('https')


exports.toObject = function(arr) {
  var rv = {}
  for (let r=0; r < arr.length; r++) { let option = arr[r]
    rv[option.option_key] = option.option_value
  }

  return rv
}

exports.intToLevel = function(levelId) {
  switch (levelId) {
    case 1:
      return 'newbie';
    case 2:
      return 'elementary';
    case 6:
      return 'preInt';
    case 3:
      return 'intermediate';
    case 4:
      return 'upperInt';
    case 5:
      return 'advanced';
    default:
      return 'newbie'
  }
}

exports.accessMap = function(level) {
  switch (level) {
    case 1:
      return 'admin'
    case 5:
      return 'premium'
    case 6:
      return 'basic'
    case 7:
      return 'free'
    default:
      return 'free'
  }
}

exports.getCurrentUser = async function(req, res, next){
    
  
  var options = {
    'headers': {
      'Cookie': req.headers.cookie
    }
  };
  let url = 'https://www.chinesepod.com/api/v1/entrance/get-user'

  let currentUser = await axios.get(url,options)

  return currentUser.data

}

exports.extractToken = function(req){
    
  let token = req.headers.authorization
  token = token.replace("Bearer ","")

  let data =  JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
  return data.data

}

exports.getDomain = function(){
  return "https://www.chinesepod.com"
}

exports.getCollectionFromUrl = function(url) {
  let collectionPath = [
    // AUTH config/routes 367 - 394
    { url: '/api/v1/auth/facebook', action: 'facebookAuth' },
    { url: '/api/v1/auth/facebook/callback', action: 'facebookCallback' },
    { url: '/api/v1/auth/google', action: 'googleAuth' },
    { url: '/api/v1/auth/google/callback', action: 'googleCallback' },
    { url: '/api/v1/sso/discourse', action: 'ssoDiscourse' },
    { url: '/api/v1/sso/google', action: 'ssoGoogleAuth' },
    { url: '/api/v1/sso/facebook', action: 'ssoFacebookAuth' },

    // WEBHOOKS config/routes 400 - 410
    { url: '/api/v1/webhooks/mautic/update', action: 'webhookMauticUpdate' },
    { url: '/api/v1/webhooks/stripe/failed', action: 'webhookMauticFailed' },
    { url: '/api/v1/webhooks/paypal', action: 'webhookPaypal' },
    { url: '/api/v1/webhooks/apple/subscriptions', action: 'webhookAppleSubscription' },

    // API COMPONENTS config/routes 425 - 
    // PAYMENTS 425 - 452
    { url: '/api/v1/paypal/cancel', action: 'paypalCancel' },
    { url: '/api/v1/paypal/create', action: 'paypalCreate' },
    { url: '/api/v1/paypal/success', action: 'paypalSuccess' },
    { url: '/api/v1/paypal/execute', action: 'paypalExecute' },
    { url: '/api/v1/paypal/execute-checkout', action: 'paypalCheckout' },
    { url: '/api/v1/purchase/paypal/execute-gift-checkout', action: 'paypalExecuteGift' },
    { url: '/api/v1/purchase/stripe/card-gift-checkout', action: 'cardGiftPurchase' },
    { url: '/api/v1/iap/apple/subscribe', action: 'appleSubscribe' },
    { url: '/api/v1/purchase/invoice/paypal-invoice-payment', action: 'paypalInvoicePayment' },
    { url: '/api/v1/purchase/invoice/card-invoice-payment', action: 'cardInvoicePayment' },
    { url: '/api/v1/purchase/invoice/card-academic-invoice-payment', action: 'cardAcademicInvoicePayment' },

    // ENTRANCE
    { url: '/api/v1/placement/email-results', action: 'emailResults' },
    { url: '/api/v1/entrance/signup', action: 'entranceSignup' },
    { url: '/api/v1/entrance/signup-app', action: 'entranceSignupApp' },
    { url: '/api/v1/entrance/google', action: 'entranceGoogle' },
    { url: '/api/v1/entrance/login', action: 'entranceLogin' },
    { url: '/api/v1/entrance/password/reset', action: 'entranceReset' },
    { url: '', name: '' },
  


    { url: '/api/v1/entrance/password/update', action: 'entrance/update-password-and-login'} ,
    { url: '/api/v1/entrance/send-message', action: 'deliver-contact-form-message' },
    { url: '/api/v1/entrance/send-corporate-message', action: 'deliver-corporate-form-message'},
    { url: '/api/v1/onboarding/pricing', action: 'onboarding/pricing' },
    { url: '/api/v1/onboarding/level', action: 'onboarding/level' },
    { url: '/api/v1/onboarding/redeem', action: 'redeem/redeem-voucher' },
    { url: '/api/v1/onboarding/redeem-app', action: 'redeem/redeem-voucher-app'},
    { url: '/api/v1/purchase/checkout',action: 'purchase/checkout' },
    { url: '/api/v1/purchase/checkout/paypal/cancel', action: 'purchase/checkout'},
    { url: '/api/v1/purchase/check-promo',action: 'purchase/check-promo' },
    { url: '/api/v1/purchase/check-email',action: 'purchase/check-email' },
    { url: '/api/v1/account/update-options',action: 'account/update-options' },
    { url: '/api/v1/account/subscriptions/update', action: 'account/subscription/update-stripe-subscription-card'},
    { url: '/api/v1/account/subscriptions/restart', action: 'account/subscription/restart-stripe-subscription'},
    { url: '/api/v1/account/subscriptions/cancel',action: 'account/subscription/cancel-stripe-subscription'},
    { url: '/api/v1/account/subscription/subscriptions', action: 'account/subscription/get-subscriptions'},
    { url: '/api/v1/account/subscription/transactions', action: 'account/subscription/get-transactions'},
    { url: '/api/v1/account/profile/update', action: 'account/settings/update-profile'},
    { url: '/api/v1/account/profile/resend-confirmation', action: 'account/settings/resend-email-confirmation'},
    { url: '/api/v1/account/settings/update', action: 'account/settings/update-setting'},
    { url: '/api/v1/account/upload-avatar', action: 'account/upload-avatar'},

    // Information Routes - Health Check
    { url: '/api/v1/request',action: 'health/request' },
    { url: '/api/v1/health/time',action: 'health/time' },

    //Lesson Recap Routes
    { url: '/api/v1/recap/submit/signup',action: 'recap/beta/signup-form' },
    { url: '/api/v1/recap/submit/feedback',action: 'recap/beta/feedback-form' },
    { url: '/api/v1/recap/get-popular-lessons', action: 'recap/get-popular-lessons'},
    { url: '/api/v1/recap/get-popular-recap-lessons', action: 'recap/get-popular-recap-lessons'},
    { url: '/api/v1/recap/get-all-recap-lessons', action: 'recap/get-all-recap-lessons'},
    { url: '/api/v1/recap/get-lessons',action: 'recap/get-user-lesson' },
    { url: '/api/v1/recap/get-news',action: 'recap/get-news' },
    { url: ' /api/v1/recap/get-content/:lessonId', action: 'recap/list-recap-files'},
    { url: '/api/v1/recap/request-lesson',action: 'recap/request-lesson' },
    { url: '/api/v1/recap/users',action: 'recap/users-by-current-lesson' },
    { url: '/api/v1/recap/upload', action: 'recap/upload-recap'},
    { url: '/api/v1/recap/upload-demo', action: 'recap/upload-recap-demo'},
    { url: '/api/v1/recap/ready-lessons', action: 'admin/recap/put-ready-lessons'},
    { url: '/api/v1/recap/ready-lessons', action: 'admin/recap/delete-ready-lessons' },

    //General Info Routes
    { url: '/api/v1/health/ip-info',action: 'health/ip-info' },
    { url: '/api/v1/health/generate-words',action: 'generate-words' },

    //AUTH
    { url: '/api/v1/entrance/get-user',action: 'auth/get-user' },

    //Dashboard Routes
    { url: '/api/v1/dashboard/history',action: 'history' },
    { url: '/api/v1/dashboard/bookmarks',action: 'bookmarks' },
    { url: '/api/v1/dashboard/get-course',action: 'dashboard/get-course' },
    { url: '/api/v1/dashboard/user-courses',action: 'courses' },
    { url: '/api/v1/dashboard/set-course-as-main', action: 'dashboard/set-course-as-main'},
    { url: '/api/v1/dashboard/more-courses',action: 'dashboard/more-courses' },
    { url: '/api/v1/dashboard/course-lessons',action: 'dashboard/course-lessons' },
    { url: '/api/v1/dashboard/all-lessons',action: 'dashboard/all-lessons' },
    { url: '/api/v1/dashboard/get-all-lessons', action: 'dashboard/get-all-lessons' },
    { url: '/api/v1/dashboard/get-bookmarked-lessons', action: 'dashboard/get-bookmarked-lessons' },
    { url: '/api/v1/dashboard/get-studied-lessons', action: 'dashboard/get-studied-lessons' },
    { url: '/api/v1/dashboard/all-courses',action: 'dashboard/all-courses' },
    { url: '/api/v1/dashboard/all-playlists',action: 'dashboard/all-playlists' },
    { url: '/api/v1/dashboard/toggle-saved',action: 'dashboard/toggle-saved' },
    { url: '/api/v1/dashboard/toggle-studied', action: 'dashboard/toggle-studied' },
    { url: '/api/v1/dashboard/toggle-course',action: 'dashboard/toggle-course' },
    { url: '/api/v1/dashboard/get-stats',action: 'stats' },
    { url: '/api/v1/dashboard/get-info',action: 'info' },
    { url: '/api/v1/dashboard/onboarding/questions', action: 'dashboard/onboarding/get-onboarding-questions' },
    { url: '/api/v1/dashboard/onboarding/questions', action: 'dashboard/onboarding/put-onboarding-questions' },
    { url: '/api/v1/dashboard/get-suggestions', action: 'dashboard/get-suggestions' },
    { url: '/api/v1/dashboard/event',action: 'dashboard/put-event' },

    //Lesson Routes
    { url: '/api/v1/lessons/get-sitemap',action: 'lessons/get-sitemap' },
    { url: '/api/v1/lessons/get-details/:id?',action: 'lessons/get-details' },
    { url: '/api/v1/lessons/get-lesson/:lessonId?',action: 'lessons/get-lesson' },
    { url: '/api/v1/lessons/get-dialogue',action: 'lessons/get-dialogue' },
    { url: '/api/v1/lessons/get-vocab',action: 'lessons/get-vocab' },
    { url: '/api/v1/lessons/get-downloads',action: 'lessons/get-downloads' },
    { url: '/api/v1/lessons/get-expansion',action: 'lessons/get-expansion' },
    { url: '/api/v1/lessons/get-grammar',action: 'lessons/get-grammar' },
    { url: '/api/v1/lessons/get-comments',action: 'lessons/get-comments' },
    { url: '/api/v1/lessons/comments',action: 'lessons/comments/create' },
    { url: '/api/v1/lessons/comments',action: 'lessons/comments/update' },
    { url: '/api/v1/lessons/comments',action: 'lessons/comments/delete' },
    { url: '/api/v1/lessons/rating',action: 'lessons/ratings/put-lesson-rating' },
    { url: '/api/v1/lessons/progress', action: 'lessons/progress/get-lesson-progress' },
    { url: '/api/v1/lessons/progress', action: 'lessons/progress/post-lesson-progress' },

    //Exercise Routes
    { url: '/api/v1/exercises/get-questions',action: 'exercises/get-questions' },
    { url: '/api/v1/exercises/results',action: 'exercises/results/get' },
    { url: '/api/v1/exercises/results',action: 'exercises/results/post' },

    //Testing Routes
    { url: '/api/v1/testing/results', action: 'testing/put-score'},
    { url: '/api/v1/testing/put-score', action: 'testing/put-score' },

    //VOCABULARY Routes
    { url: '/api/v1/vocabulary/words',action: 'vocabulary/words/get-all-words' },
    { url: '/api/v1/vocabulary/words/:id', action: 'vocabulary/words/get-word-by-id' },
    { url: '/api/v1/vocabulary/words/add',action: 'vocabulary/words/add-word' },
    { url: '/api/v1/vocabulary/words/add-many', action: 'vocabulary/words/add-many-words' },
    { url: '/api/v1/vocabulary/words/create', action: 'vocabulary/words/create-word' },
    { url: '/api/v1/vocabulary/words/create-batch', action: 'vocabulary/words/create-batch' },
    { url: '/api/v1/vocabulary/words/add-sentence', action: 'vocabulary/words/add-sentence' },
    { url: '/api/v1/vocabulary/words/:id', action: 'vocabulary/words/update-word' },
    { url: '/api/v1/vocabulary/words/:id', action: 'vocabulary/words/delete-word' },
    { url: '/api/v1/vocabulary/words/delete-many', action: 'vocabulary/words/delete-many-words' },

    { url: '/api/v1/vocabulary/decks',action: 'decks' },
    { url: '/api/v1/vocabulary/decks/:id', action: 'vocabulary/decks/get-deck-by-id' },
    { url: '/api/v1/vocabulary/decks', action: 'vocabulary/decks/create-deck' },
    { url: '/api/v1/vocabulary/decks/add', action: 'vocabulary/decks/add-word-to-deck' },
    { url: '/api/v1/vocabulary/decks/remove', action: 'vocabulary/decks/remove-word-from-deck' },
    { url: '/api/v1/vocabulary/decks/:id', action: 'vocabulary/decks/update-deck' },
    { url: '/api/v1/vocabulary/decks/:id', action: 'vocabulary/decks/delete-deck' },

    //FLASHCARD ROUTES
    { url: '/api/v1/vocabulary/review/all', action: 'vocabulary/review/get-all-words' },
    { url: '/api/v1/vocabulary/review/:id', action: 'vocabulary/review/get-deck-by-id' },
    { url: '/api/v1/vocabulary/review', action: 'vocabulary/review/post-reviews' },

    // VOCABULARY REVIEW STATISTICS:
    { url: '/api/v1/vocabulary/statistics/:id', action: 'vocabulary/statistics/get-deck-by-id' },

    //PUBLIC VOCAB
    { url: '/api/v1/vocabulary/lists/:listId', action: 'vocabulary/words/get-defined-list' },

    //Feedback Routes
    { url: '/api/v1/feedback/dashboard-feedback', action: 'feedback/dashboard-feedback' },
    { url: '/api/v1/feedback/dashboard-feedback-all', action: 'feedback/dashboard-feedback-all' },
    { url: '/api/v1/feedback/dashboard-feedback-web', action: 'feedback/dashboard-feedback-web' },

    { url: '/api/v1/feedback/flashcard-feedback', action: 'feedback/deliver-flashcard-feedback-message' },
    { url: '/api/v1/feedback/lmfm-feedback', action: 'feedback/deliver-lmfm-feedback-message' },

    // LOG ROUTES
    { url: '/api/v1/logs/game-logs',action: 'logs/put-game-logs' },
    { url: '/api/v1/logs/custom-logs',action: 'logs/put-custom-logs' },
    { url: '/api/v1/logs/recap-logs',action: 'logs/put-recap-logs' },

    //Captcha Routes
    { url: '/api/v1/captcha',action: 'captcha/check-captcha' },

    // Token Routes
    { url: '/api/v1/token',action: 'token/check' },
    { url: '/api/v1/token',action: 'token/get' },
    { url: '/api/v1/token/auth',action: 'token/auth' },
    { url: '/api/v1/token/refresh',action: 'token/refresh' },

    // Link Device Routes
    { url: '/api/v1/device/code',action: 'device/get-code' },
    { url: '/api/v1/device/code',action: 'device/link-code' },
    { url: '/api/v1/device/code/:id',action: 'device/confirm-code' },

    //AFFILIATE ROUTES
    { url: '/api/v1/affiliate/enroll',action: 'affiliate/enroll' },
    { url: '/api/v1/affiliate/options',action: 'affiliate/get-options' },
    { url: '/api/v1/affiliate/options',action: 'affiliate/post-options' },
    { url: '/api/v1/affiliate/leads',action: 'affiliate/get-leads' },
    { url: '/api/v1/affiliate/payments',action: 'affiliate/get-payments' },

    //AFFILIATE - ADMIN ROUTES
    { url: '/api/v1/affiliates/users', action: 'affiliates/admin/list-affiliates' },
    { url: '/api/v1/affiliates/users/:id', action: 'affiliates/admin/get-affiliate' },
    { url: '/api/v1/affiliates/users', action: 'affiliates/admin/create-affiliate' },
    { url: '/api/v1/affiliates/users/:id', action: 'affiliates/admin/update-affiliate' },
    { url: '/api/v1/affiliates/users/:id', action: 'affiliates/admin/delete-affiliate' },

    { url: '/api/v1/affiliates/statistics/:id', action: 'affiliates/admin/get-statistics' },

    { url: '/api/v1/affiliates/invoices', action: 'affiliates/admin/list-invoices' },
    { url: '/api/v1/affiliates/invoices', action: 'affiliates/admin/create-invoice' },
    { url: '/api/v1/affiliates/invoices/:id', action: 'affiliates/admin/update-invoice' },
    { url: '/api/v1/affiliates/invoices/:id', action: 'affiliates/admin/delete-invoice' },
    { url: '/api/v1/affiliates/confirm', action: 'affiliates/admin/confirm-affiliate' },

    //AFFILIATE - USER ROUTES
    { url: '/api/v1/affiliates/affiliate', action: 'affiliates/user/get-affiliate' },
    { url: '/api/v1/affiliates/statistics', action: 'affiliates/user/get-statistics' },
    { url: '/api/v1/affiliates/register', action: 'affiliates/user/register-affiliate' },
    { url: '/api/v1/affiliates/affiliate', action: 'affiliates/user/get-referrals' },
    { url: '/api/v1/affiliates/affiliate', action: 'affiliates/user/update-affiliate' },

    //ADS
    { url: '/api/v1/ads/android-app',action: 'ads/android-app' },

    //TUTORIALS
    { url: '/api/v1/tutorials/android-intro-video', action: 'tutorials/android-intro-video' },

    //ACCESS CODES
    { url: '/api/v1/admin/access-codes/generate', action: 'admin/access-codes/generate-access-codes' },
    { url: '/api/v1/admin/access-codes/delete', action: 'admin/access-codes/delete-access-codes' },
    { url: '/api/v1/admin/academic-codes/generate', action: 'admin/academic-codes/generate-academic-codes' },
    { url: '/api/v1/admin/academic-codes/delete', action: 'admin/academic-codes/delete-academic-codes' },
    { url: '/api/v1/admin/livestream/save-livestream-data', action: 'admin/livestream/save-livestream-data' },
    { url: '/api/v1/admin/livestream/delete-livestream-data', action: 'admin/livestream/delete-livestream-data' },

    //ADMIN
    { url: '/api/v1/admin/user-token',action: 'admin/user-token/get-token' },

    { url: '/api/v1/admin/user-data/request', action: 'admin/user-data/post-user-data-request' },
    { url: '/api/v1/admin/user-data/delete', action: 'admin/user-data/delete-user-data' },
    { url: '/api/v1/admin/user-data/search', action: 'admin/user-data/search-user-data' },
    { url: '/api/v1/admin/user-data/:id', action: 'admin/user-data/get-user-data' },

    { url: '/api/v1/admin/vouchers/create', action: 'admin/vouchers/create-vouchers' },
    { url: '/api/v1/admin/transactions/export', action: 'admin/transactions/export-transactions' },

    //SEARCH
    { url: '/api/v1/search/reindex-lessons',action: 'search/reindex-lessons' },
    { url: '/api/v1/search/reindex-phrase/:word', action: 'search/reindex-phrase' },
    { url: '/api/v1/search/search-lessons/:query?', action: 'search/search-lessons' },
    { url: '/api/v1/search/search-all-lessons/:query?', action: 'search/search-all-lessons' },
    { url: '/api/v1/search/search-dictionary/:query?', action: 'search/search-dictionary' },

    //COMMUNITY
    { url: '/api/v1/community/comments/list',action: 'community/list-comments' },
    { url: '/api/v1/community/posts/list',action: 'community/list-posts' },
    { url: '/api/v1/community/posts/user',action: 'community/list-user-posts' },
    { url: '/api/v1/community/posts/:id',action: 'community/get-post' },

    //DICTIONARY
    { url: '/api/v1/dictionary/get',action: 'dictionary/get-dictionary-word' },
    { url: '/api/v1/dictionary/get-details',action: 'dictionary/get-details' },
    { url: '/api/v1/dictionary/related',action: 'dictionary/get-related-words' },
    { url: '/api/v1/dictionary/search/:word',action: 'dictionary/search-word' },
    { url: '/api/v1/dictionary/define/:word',action: 'dictionary/define-word' },
    { url: '/api/v1/dictionary/segment/:word',action: 'dictionary/segment' },
    { url: '/api/v1/dictionary/decompose/:word', action: 'dictionary/decompose-word' },
    { url: '/api/v1/dictionary/examples/:word', action: 'dictionary/examples-word' },

    //LABELS
    { url: '/api/v1/labels/gift-packages', action: 'labels/gift-package/get-gift-package-labels' },
    { url: '/api/v1/labels/gift-packages', action: 'labels/gift-package/post-gift-package-labels' },

    //NOTIFICATIONS
    { url: '/api/v1/notifications', action: 'notifications/subscribe' },

    //YOUTUBE PROMO
    { url: '/api/v1/youtube',action: 'youtube/post-email' },
    { url: '/api/v1/youtube/:id',action: 'youtube/put-confirmation' },

    //EMAIL MARKETING
    { url: '/api/v1/email/unsubscribe-user-email', action: 'email/unsubscribe-user' },
    { url: '/api/v1/email/subscribe-user-email',action: 'email/subscribe-user' },

    { url: '/api/v1/octopus/process-inactive', action: 'octopus/process-inactive' },
    { url: '/api/v1/octopus/process-bounced',action: 'octopus/process-bounced' },
    { url: '/api/v1/octopus/process-churned',action: 'octopus/process-churned' },

    //SCHOOLZONE ROUTES
    { url: '/api/v1/schoolzone/send-schoolzone-message', action: 'deliver-schoolzone-form-message' },
    { url: '/api/v1/schoolzone/get-info', action: 'schoolzone/dashboard/get-info' },
    { url: '/api/v1/schoolzone/organizations', action: 'schoolzone/organizations/get-organizations' },
    { url: '/api/v1/schoolzone/organizations/:id', action: 'schoolzone/organizations/get-organization' },
    { url: '/api/v1/schoolzone/organizations/:id', action: 'schoolzone/organizations/post-organization' },
    { url: '/api/v1/schoolzone/organizations/:id/update', action: 'schoolzone/organizations/post-organization-update' },
    { url: '/api/v1/schoolzone/organizations/:id/logo', action: 'schoolzone/organizations/upload-organization-logo' },
    { url: '/api/v1/schoolzone/organizations/:id', action: 'schoolzone/organizations/delete-organization' },
    { url: '/api/v1/schoolzone/organizations', action: 'schoolzone/organizations/put-organization' },
    { url: '/api/v1/schoolzone/teachers/:id?', action: 'schoolzone/teachers/get-teachers' },
    { url: '/api/v1/schoolzone/teachers/:id', action: 'schoolzone/teachers/post-teacher' },
    { url: '/api/v1/schoolzone/teachers/:id/students', action: 'schoolzone/students/get-students' },
    { url: '/api/v1/schoolzone/teachers/:id/students', action: 'schoolzone/students/post-students' },
    { url: '/api/v1/schoolzone/teachers/:id', action: 'schoolzone/teachers/delete-teacher' },
    { url: '/api/v1/schoolzone/teachers', action: 'schoolzone/teachers/put-teacher' },

    { url: '/api/v1/schoolzone/search/', action: 'schoolzone/students/student-search' },

    { url: '/api/v1/schoolzone/students', action: 'schoolzone/students/get-students' },
    { url: '/api/v1/schoolzone/students/:id', action: 'schoolzone/students/get-student' },
    { url: '/api/v1/schoolzone/students/:id/stats', action: 'schoolzone/students/get-student-statistics' },
    { url: '/api/v1/schoolzone/students/:id/history', action: 'schoolzone/students/get-student-history' },
    { url: '/api/v1/schoolzone/students/all/stats', action: 'schoolzone/students/get-all-student-statistics' },
    { url: '/api/v1/schoolzone/students/all/history', action: 'schoolzone/students/get-all-student-history' },
    { url: '/api/v1/schoolzone/students', action: 'schoolzone/students/delete-students' },
    { url: '/api/v1/schoolzone/students/:id?', action: 'schoolzone/students/put-students' },
    { url: '/api/v1/schoolzone/invite/students/:id', action: 'schoolzone/invites/get-student-invite' },
    { url: '/api/v1/schoolzone/invite/students/:id', action: 'schoolzone/invites/post-student-invite' },
    { url: '/api/v1/schoolzone/invite/teachers/:id', action: 'schoolzone/invites/get-teacher-invite' },
    { url: '/api/v1/schoolzone/invite/teachers/:id', action: 'schoolzone/invites/post-teacher-invite' },

    //SCHOOLZONE CAMPAIGNS

    { url: '/api/v1/schoolzone/campaigns/leads',action: 'schoolzone/campaigns/list-leads' },
    { url: '/api/v1/schoolzone/campaigns/leads', action: 'schoolzone/campaigns/create-lead' },
    { url: '/api/v1/schoolzone/campaigns/leads/:id', action: 'schoolzone/campaigns/update-lead' },
    { url: '/api/v1/schoolzone/campaigns/leads/:id', action: 'schoolzone/campaigns/remove-lead' },
    { url: '/api/v1/schoolzone/campaigns/leads/:id/:campaignId', action: 'schoolzone/campaigns/update-lead-campaign' },
    { url: '/api/v1/schoolzone/campaigns', action: 'schoolzone/campaigns/list-campaigns' },
    { url: '/api/v1/schoolzone/campaigns/:id', action: 'schoolzone/campaigns/get-campaign' },

    { url: '/api/v1/schoolzone/tags/:id?',action: 'schoolzone/tags/get-tags' },
    { url: '/api/v1/schoolzone/tags/:id?',action: 'schoolzone/tags/put-tag' },
    { url: '/api/v1/schoolzone/tags/:id?',action: 'schoolzone/tags/put-tags' },
    { url: '/api/v1/schoolzone/tags/:id', action: 'schoolzone/tags/delete-tag' },
    { url: '/api/v1/schoolzone/tags/remove', action: 'schoolzone/tags/remove-tags' },

    // CAMPAIGN ROUTES
    { url: '/api/v1/campaigns/',action: 'campaigns/list-campaigns' },
    { url: '/api/v1/campaigns/:id',action: 'campaigns/check-campaign' },
    { url: '/api/v1/campaigns/:id',action: 'campaigns/subscribe-campaign' },
    { url: '/api/v1/campaigns/:id',action: 'campaigns/unsubscribe-campaign' },
  ]

  let found = collectionPath.find(el => el.url == url);

  return found

}