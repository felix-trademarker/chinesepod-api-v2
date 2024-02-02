## ChinesePod API V2
- Node Version: 20.7.0

### https://www.chinesepod.com/api/v2/dashboard/get-info
- this api will return the users info. <br>
Data is retrieved from mysql database chinesepod_production on tables users, user_option, user_preferences, and user_site_links. data collected were merged to one object and use upsert to update users collection in mongo158.
> Parameters: userId<br> 
Method: GET <br>
_userId is fetch via headers request with token, function can be seen in middleware.js_

### https://www.chinesepod.com/api/v2/dashboard/get-stats
- this api will return the users stats including users access. <br>
Data is retrieved from mysql database chinesepod_production on tables users, user_option, user_contents, user_preferences, contents, and user_site_links. data collected were merged to one object and use upsert to update users collection in mongo158.
> Parameters: userId<br> 
Method: GET <br>
_userId is fetch via headers request with token, function can be seen in middleware.js_

### https://www.chinesepod.com/api/v2/dashboard/course-lessons
- this api will return all courses that was saved or bookmarked lesson from a user <br>
 Data is retrieved from mysql database chinesepod_production on tables contents, user_contents and course_contents. data collected were merged to one object and use upsert to update users collection in mongo158.
> Parameters: userId<br> 
Method: GET <br>
_userId is fetch via headers request with token, function can be seen in middleware.js_

### https://www.chinesepod.com/api/v2/dashboard/user-courses
- this api will return all courses that was saved or bookmarked lesson from a user <br>
 Data is retrieved from mysql database chinesepod_production on tables user_courses, and course_detail. data collected were merged to one object and use upsert to update users collection in mongo158.
> Parameters: userId<br> 
Method: GET <br>
_userId is fetch via headers request with token, function can be seen in middleware.js_

### https://www.chinesepod.com/api/v2/dashboard/history
- this api will return the users visited lessons <br>
 Data is retrieved from mysql database chinesepod_production on tables user_contents, and contents. data collected were merged to one object and use upsert to update users collection in mongo158.
> Parameters: userId<br> 
Method: GET <br>
Condition: user_id=${userId} AND lesson_type=0 AND studied=1 From user_contents table<br>
_userId is fetch via headers request with token, function can be seen in middleware.js_

### https://www.chinesepod.com/api/v2/dashboard/bookmarks
- this api will return the users bookemarked lessons <br>
 Data is retrieved from mysql database chinesepod_production on tables user_contents, and contents. data collected were merged to one object and use upsert to update users collection in mongo158.
> Parameters: userId<br> 
Method: GET <br>
Condition: user_id=${userId} AND lesson_type=0 AND saved=1 From user_contents table<br>
_userId is fetch via headers request with token, function can be seen in middleware.js_

### https://www.chinesepod.com/api/v2/dashboard/more-courses
- this api will return the courses which users haven't enrolled yet<br>
 Data is retrieved from mysql database chinesepod_production on tables course_detail, user_options, and user_courses. data collected were merged to one object and use upsert to update users collection in mongo158.
> Parameters: userId<br> 
Method: GET <br>
Condition: course_id NOT IN (${enrolledCourses.join(',')}) From course_detail table<br>
_userId is fetch via headers request with token, function can be seen in middleware.js_

### https://www.chinesepod.com/api/v2/dashboard/all-lessons
- this api will return all visited lessons by the user<br>
 Data is retrieved from mysql database chinesepod_production on tables contents, and user_contents.
> Parameters: userId, limit, skip<br> 
Method: GET <br>
_userId is fetch via headers request with token, function can be seen in middleware.js_

### https://www.chinesepod.com/api/v2/dashboard/get-bookmarked-lessons
- this api will return the users bookemarked lessons <br>
 Data is retrieved from mysql database chinesepod_production on tables user_contents, and contents. data collected were merged to one object and use upsert to update users collection in mongo158.
> Parameters: userId<br> 
Method: GET <br>
Condition: user_id=${userId} AND lesson_type=0 AND saved=1 From user_contents table<br>
_userId is fetch via headers request with token, function can be seen in middleware.js_

### https://www.chinesepod.com/api/v2/dashboard/get-studied-lessons
- this api will return the users visited lessons <br>
 Data is retrieved from mysql database chinesepod_production on tables user_contents, and contents. data collected were merged to one object and use upsert to update users collection in mongo158.
> Parameters: userId<br> 
Method: GET <br>
Condition: user_id=${userId} AND lesson_type=0 AND studied=1 From user_contents table<br>
_userId is fetch via headers request with token, function can be seen in middleware.js_

### https://www.chinesepod.com/api/v2/dashboard/all-courses
- this api will return all courses <br>
 Data is retrieved from mysql database chinesepod_production on tables course_detail, and channel_detail. data collected were merged to one object and use upsert to update users collection in mongo158.
> Method: GET <br>

### https://www.chinesepod.com/api/v2/dashboard/all-playlists
- this api will return all play list <br>
 Data is retrieved from mysql database chinesepod_production on tables course_detail.
> Method: GET <br>
Condition: pubstatus=1 AND is_private=0 AND order_id >= 1000

### https://www.chinesepod.com/api/v2/dashboard/onboarding/questions
- this api will return onboarding questions <br>
 Data is retrieved from mysql database chinesepod_production on tables user_options and external file onboarding.json located under __/lib__ folder.
> Method: GET <br>
_userId is fetch via headers request with token, function can be seen in middleware.js_

### https://www.chinesepod.com/api/v2/dashboard/get-suggestions
- this api will return suggested lessons for the current user <br>
 Data is retrieved from mysql database chinesepod_production on table user_options and find users interest and relevent courses from user_courses and course_detail table.
> Parameters: userId<br> 
 Method: GET <br>
_userId is fetch via headers request with token, function can be seen in middleware.js_

### https://www.chinesepod.com/api/v2/dashboard/get-course
- this api will return course object and lessons that the users bookmarked or saved<br>
 Data is retrieved from mysql database chinesepod_production on table course_detail, course_contents, contents, and user_contents.
> Parameters: courseId<br> 
 Method: GET <br>
_userId is fetch via headers request with token, function can be seen in middleware.js_

### https://www.chinesepod.com/api/v2/dashboard/get-all-lessons
- this api will return all users visited lesson<br>
 Data is retrieved from mysql database chinesepod_production on table user_contents and contents table.
> Parameters: userId<br> 
 Method: GET <br>
_userId is fetch via headers request with token, function can be seen in middleware.js_

<br>
<hr>
<br>

### https://www.chinesepod.com/api/v2/lessons/get-dialogue
- this api will return all related dailogue lessons<br>
 Data is retrieved from mysql database chinesepod_production on table content_dialogues. data collected were merged to one object and use upsert to update lessons collection in mongo158
> Parameters: lessonId<br> 
 Method: GET

### https://www.chinesepod.com/api/v2/lessons/get-expansion
- this api will return all related expansion lessons<br>
 Data is retrieved from mysql database chinesepod_production on table content_expansions. data collected were merged to one object and use upsert to update lessons collection in mongo158
> Parameters: lessonId, limit, skip<br> 
 Method: GET

### https://www.chinesepod.com/api/v2/lessons/get-details/<ID|SLUG>
- this api will return formatted lesson data<br>
 Data is retrieved from mysql database chinesepod_production on table contents, data is filtered and convert pinyin characters. data collected saved in lessons collection using upsert method.
> Parameters: id <ID|SLUG><br> 
 Method: GET

 ### https://www.chinesepod.com/api/v2/lessons/get-vocab
- this api will return all related vocabularies lessons<br>
 Data is retrieved from mysql database chinesepod_production on table content_vocabularies. data collected were merged to one object and use upsert to update lessons collection in mongo158
> Parameters: lessonId, limit, skip<br> 
 Method: GET

### https://www.chinesepod.com/api/v2/lessons/get-downloads
- this api will return all related downloads lessons<br>
 Data is retrieved from mysql database chinesepod_production on table contents. data collected were merged to one object and use upsert to update lessons collection in mongo158
> Parameters: lessonId<br> 
 Method: GET

 ### https://www.chinesepod.com/api/v2/lessons/get-comments
- this api will return all related comments lessons<br>
 Data is retrieved from mysql database chinesepod_production on table comments, user_preferences, and users. data collected were merged to one object and use upsert to update lessons collection in mongo158
> Parameters: lessonId<br> 
 Method: GET

  ### https://www.chinesepod.com/api/v2/lessons/get-grammar
- this api will return all related grammar lessons<br>
 Data is retrieved from mysql database chinesepod_production on table content_grammar_tag, grammar_block, grammar_sentence, and grammar_detail. data collected were merged to one object and use upsert to update lessons collection in mongo158
> Parameters: lessonId<br> 
 Method: GET

### https://www.chinesepod.com/api/v2/exercises/get-questions
- this api will return object of array with exercises questions<br>
 Data is retrieved from mysql database assessment on table questions. data collected were merged to one object and use upsert to update lessons collection in mongo158
> Parameters: lessonId<br> 
 Method: GET

 ### https://www.chinesepod.com/api/v2/vocabulary/decks
- this api will return users vocabulary decks<br>
 Data is retrieved from mysql database chinesepod_production on table user_vocabulary_to_vocabulary_tags, user_vocabulary, and vocabulary_tags. data collected were merged to one object and use upsert to update users collection in mongo158
> Parameters: userId<br> 
 Method: GET


<br>
<hr>
<br>

## CUSTOM API
### https://www.chinesepod.com/api/v2/user/subscriptions?email=<EMAIL>
- this api will return all users subscription and access type and expiry<br>
 Data is retrieved from mysql database chinesepod_production on table user_site_links and compare expiry from users in mongo under accessType object.
> Parameters: email<br> 
 Method: GET <br>

### https://www.chinesepod.com/api/v2/user/confirm-email?email=<EMAIL>
- this api will set users email confirmation <br>
 Data is updated in mysql database chinesepod_production on table users.
> Parameters: email<br> 
 Method: GET <br>


 <br>
 <br>
 <br>
 <br>
 <br>
*NOTE: server update needs to install xml-js