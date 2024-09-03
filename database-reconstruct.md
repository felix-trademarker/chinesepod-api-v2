## ChinesePod Lessons Collection
Reconstruct content data from mysql to mongo database

### MYSQL LESSON TABLES ###
**Contents**: This table contains the main content of each lesson. This also holds the old wistia video ID’s which is already replaced by S3, and links on each video are in mongo158 on lessons.new.sources collection.
**Fields:**
- content_id
- created_at
- updated_at
- status_comments
- status_locked
- status_published
- created_by
- updated_by
- popularity
- rank
- slug
- type
- series_id
- channel_id
- maturity
- title
- introduction
- theme
- channel
- level
- hosts
- v3_id
- hash_code
- publication_timestamp
- time_offset
- image
- transcription1
- transcription2
- mp3_dialogue
- mp3_media
- mp3_mobile
- mp3_public
- mp3_private
- mp3_thefix
- pdf1
- pdf2
- pdf3
- pdf4
- ppt
- ppt_size
- video_fix
- link_source
- link_related
- exercises_exercise1
- exercises_exercise2
- exercises_exercise3
- exercises_exercise4
- xml_file_name
- mp3_dialogue_size
- mp3_media_size
- mp3_mobile_size
- mp3_public_size
- mp3_private_size
- mp3_thefix_size
- mp3_thefix_length
- mp3_public_length
- mp3_private_length
- mp3_mobile_length
- mp3_media_length
- mp3_dialogue_length
- video_flv
- video_flv_size
- video_flv_length
- video_mp4
- video_mp4_size
- video_mp4_length
- video_m4v
- video_m4v_size
- video_m4v_length
- last_comment_id
- last_comment_time
- is_private
- video
- lesson_plan
- lesson_assignment

**content_rates**: This table contains the ratings on each lesson from users. Content_rates links data from contents and users by using a foreign key user_id and v3_id.

**content_dialogues**: This table contains the list of dialogue for each lesson, data is linked using a foreign key v3_id. Data consist of traditional, simplified, english and pinyin sentences.

**content_expansions**: This table contains the list of expansions for each lesson, data is linked using a foreign key v3_id. Data consist of traditional, simplified, english and pinyin sentences.

**content_grammar_tag**: This table contains the list of grammar ID’s which is linked to contents using v3_id. grammar_id can be found in the grammar_details table.

**grammar_details**: This table contains the main grammar data.

**grammar_block**: This table contains the list of grammar ID’s to group each block of grammar contents. This table links to grammar_details using grammar_id.

**grammar_sentence**: This table contains the grammar sentence usage. This table links to grammar_block using grammar_block_id.

**content_dialogues**: This table contains the list of dialogue for each lesson, data is linked using a foreign key v3_id. Data consist of traditional, simplified, english and pinyin sentences.

**vocabulary**: This table contains the list of vocabulary for each lesson, data is linked using a foreign key v3_id and data are separated from vocabulary_class ‘Key Vocabulary’ or ‘Supplementary’. Data consist of traditional, simplified, english and pinyin words.

**comments**: This table contains all comments on each lesson. Data is linked using parent_id as the ve_id on contents fields and user_id in users table.

**questions**: This table contains all questions on each lesson. The table is in the Assessment database and on the questions table. The data set of questions are stored as xml data in the options field.

### MONGO DATABASE PROPOSITION ###
Merge dialogue, expansion, grammar, vocabulary, comments, and question to lessons collection, we will create an array of objects under lessons collection. In the contents data we can leave other fields that weren’t used in the API and or the fields that are unknown usage. In this way we can fetch the lesson contents with it's related data, and in API call we can directly fetched the lesson contents and or the related data from a lesson without refiltering the raw data from mysql.

**Below table is the proposed collection in mongo**


| Field | Type | Description | DATABASE | TABLE |
|---|---|---|---|---|
| id | varchar | mysql default ID(auto-increment) | chinesepod_production | contents |
| hash_code | varchar | code to locate assets in S3 like images and videos | chinesepod_production | contents |
| hosts | string | Lesson host name | chinesepod_production | contents |
| image | string | image location (URI) | chinesepod_production | contents |
| introduction | string | Lesson introduction description | chinesepod_production | contents |
| level | string | Lesson level | chinesepod_production | contents |
| mp3_dialogue | string | Lesson audio url | chinesepod_production | contents |
| mp3_private | string | Lesson private audio url | chinesepod_production | contents |
| mp3_public | string | Lesson public audio url | chinesepod_production | contents |
| mp3_thefix | string | Lesson reviews audio url (Downloadable File) | chinesepod_production | contents |
| pdf1 | string | Lesson reviews PDF Document 1 (Downloadable File) | chinesepod_production | contents |
| pdf2 | string | Lesson reviews PDF Document 2 (Downloadable File) | chinesepod_production | contents |
| publication_timestamp | string | date when lesson is published | chinesepod_production | contents |
| slug | string | URL friendly derived from lesson title | chinesepod_production | contents |
| title | string | lesson title | chinesepod_production | contents |
| type | string | lesson type (lesson, extra, video) | chinesepod_production | contents |
| extra | boollean | identify if lesson is extra | chinesepod_production | contents |
| sources | object | array of objects contains lessons url (HLS, youtube) | mongo158 (chinesepod) | api.lessons.new.sources |
| dialogue | object | array of objects contains dialogue lessons | chinesepod_production | content_dialogues |
| expansion | object | array of objects contains expansion lessons | chinesepod_production | content_expansions |
| vocabulary | object | array of objects contains vocabulary lessons | chinesepod_production | vocabulary |
| comments | object | array of objects contains comments lessons | chinesepod_production | comments, users, user_preferences |
| exercises | object | array of objects contains exercises lessons | assessments | questions |
| grammar | object | array of objects contains grammar lessons | chinesepod_production | content_grammar_tag, grammar_block, grammar_sentence, grammar_detail |

## ChinesePod Users Collection
Reconstruct users data from mysql to mongo database

### MYSQL USERS TABLES ###
**Users**: This table contains list of CRM users, table is under chinesepod2015 database.

**users**: This table contains the main content of each user. This also holds the users last seen set in field admin_note which is unix value. 'ltv' and 'ltsm' fields are still under investigation on how this fields works.

**usertypes**: This table contains user types like 'premium', this table is a reference table from users which is linked using foreign key in users table usertype_id.

**user_site_links**: This table contains user settings includes subscription expiry date.

**user_options**: This table contains user options like level, interests weekly goals, table links to users using user_id.

**sz_students**: This table contains list of student users, linked to users table using user_id.

**sz_org_staff**: This table contains list of teacher users, linked to users table using user_id.

**user_preferences**: This table contains list of users preferences, this records the users last login and login times. data is linked to users table using user_id.

**user_contents**: This table contains list of users studied and bookmarked lessons.

**user_courses**: This table contains list of user courses taken.

**user_actions**: This table contains list of user actions from lesson page, this records the users action like adding vocabulary word

**user_action_type**: This table contains list of action type, this linked to user_actions table using user_id as an identifier.

**user_daily_stats**: This table contains list of users progress on each lesson and records the average score from exercises.

**user_addresses**: This table contains user address.

**user_course_contents**: This table contains list of users lessons with course.

**user_courses**: This table contains list of users courses.

**user_groups**: This table contains list of user group id and which user role.

**user_level_test**: This table contains users test levels

**user_log**: This table contains users logs, this records which page users visited

**user_settings**: This table contains users settings, saved data are unserialized

### MONGO DATABASE PROPOSITION ###
Merge users vocabulary, grammar ,decks, history, and bookmarked to users collection, we will create an array of objects under users collection. In the users data we can leave other fields that weren’t used in the API and or the fields that are still need further usage investigation. In this way we can fetch the users contents with it's related data, and in API call we can directly fetched the users contents and or the related data from a users without refiltering the raw data from mysql.

**Below table is the proposed collection in mongo**


| Field | Type | Description | DATABASE | TABLE |
|---|---|---|---|---|
| id | varchar | mysql default ID(auto-increment) | chinesepod_production | users |
| email | varchar | users email address (unique) | chinesepod_production | users |
| name | varchar | users full name | chinesepod_production | users |
| password | varchar | users password, hash string | chinesepod_production | users |
| sex | varchar | users gender | chinesepod_production | users |
| trail | datetime | users trail date | chinesepod_production | users |
| trail | datetime | users trail date activated | chinesepod_production | users |
| access | varchar | users access type free or premium | chinesepod_production | user_site_links |
| autoMarkStudied | boolean | users settings after lesson study to auto mark lesson | chinesepod_production | user_options |
| charSet | boolean | users prefered chat set on lessons | chinesepod_production | user_options |
| currentLesson | boolean | users current lesson studied | chinesepod_production | user_options |
| currentLesson | boolean | users current lesson | chinesepod_production | user_options |
| lastLogin | datetime | users last login (admin_note field - unix format) | chinesepod_production | users |
| level | int | users level range 1-5 newbie, elementary, preInt, intermediate, upperint, advance | chinesepod_production | users |
| newDash | boolean | users site preference in using of old and new dashboard | chinesepod_production | user_options |
| pinyin | boolean | users site preference in using pinyin | chinesepod_production | user_options |
| timezone | varchar | users timezone per country | chinesepod_production | user_options |
| avatar | varchar | users URL profile picture | chinesepod_production | user_preferences |
| confirmStatus | int | users email confirmation | chinesepod_production | users |
| createdAt | datetime | account date created | chinesepod_production | users |
| updatedAt | datetime | account date updated | chinesepod_production | users |
| addresses | Object | users addresses | chinesepod_production | users, user_addresses  |
| accessType | Object | users subscription type with expiry date. object is validated from multiple tables related to users table to identify users account subscriptions | chinesepod_production | users, user_site_links, sz_organizations, sz_students, sz_org_staff  |
| subscriptions | array of objects | user list of subscriptions | chinesepod_production | subscriptions  |
| emailLogs | array of objects | user list of email logs | chinesepod_logging | email_logs  |
| dictionaries | array of objects | user listed dictionaries | chinesepod_production | dictionary_search  |
| vocabularies | array of objects | user listed vocabularies. Tables are join to fetch users vocabularies | chinesepod_production | users, user_vocabulary, user_vocabulary_to_vocabulary_tags, vocabulary_tags  |
| courses | array of objects | user list of courses taken. Tables are join to fetch users courses | chinesepod_production | users, course_detail, user_courses |
| history | array of objects | user list of lessons taken | chinesepod_production | user_contents |
| bookmarks | array of objects | user list of bookmarked lessons | chinesepod_production | user_contents |

## ChinesePod Orders Collection
Reconstruct orders data from mysql to mongo database

### MYSQL USERS TABLES ###
**orders**: This table contains list of order data from customers, table is under chinesepod_production database and this is table reference to other mysql tables such as transactions, users, products and products from old database "chinesepod_2015".

**transactions**: This table contains list of customers transaction and links to customers subscription record

**transaction_logs**: This table contains list of transaction logs, records transactions status either success, denied or any error while making the transaction.

**subscriptions**: This table contains list of users subscriptions, this also records the next billing and product info. subscriptions are created after a transaction is completed and sets the expiry date according to the purchased plan.

**products**: This table contains list of products offered in the site and also contains the length of each subscriptions.

**Below table is the proposed collection in mongo**

| Field | Type | Description | DATABASE | TABLE |
|---|---|---|---|---|
| id | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| transaction_id | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| subscription_id | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| user_id | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| product_id | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| product_length | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| is_old | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| product_price | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| currency | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| is_recurring_payment | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| is_recurring_product | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| discount | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| balance_before | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| balance_after | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| billed_amount | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| promotion_code | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| voucher_code | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| pay_status | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| pay_method | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| notes | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| country | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| region | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| city | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| ip_address | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| date_created | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| created_by | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| modified_by | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| last_modified | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |
| email | varchar | mysql default ID(auto-increment) | chinesepod_production | orders |


__Field Notes: *Leave field entirely if value is null or empty string__

__Email Notes: *Leave field entirely if value is null or empty string__ 