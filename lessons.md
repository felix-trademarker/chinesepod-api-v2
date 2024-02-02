## ChinesePod Lessons Collection
Reconstruct data from mysql to mongo database

### MYSQL LESSON TABLES ###
**Contents**: This table contains the main content of each lesson. This also holds the old wistia video ID’s which is already replaced by S3, and links on each video are in mongo158 on lessons.new.sources collection.

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
