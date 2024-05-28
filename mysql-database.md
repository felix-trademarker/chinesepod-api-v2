### MYSQL TABLES ###
## chinesepod_production ##

**USD_exchange_rates**: List of USD conversion rates, not sure if this is updated or used in the current system.
**abtest_data**: test data for model views, not used in the current system.
**abtest_orders**: list of order ID's, data last entry was last 2013.
**abtest_plans**: list of user plans, last entry was last 2011, not used in the current system.
**access_academic_codes**: list of access codes used for selected admin users
**access_voucher_codes**: list of voucher codes with expiry status, last update 2020 by Ugis
**ads**: list of image url used in ads
**affiliate_details**: This stores all affiliated users.
**affiliate_events**: This records all users events and links to users and affiliated users.
**affiliate_invoices**: list of users generated invoices
**affiliate_log**: Log affiliate invites and records the origin
**ages**: age brackets 
**api_clients**: list of client id and secret keys
**api_custom**: list of set of query strings 
**api_log**: 
**api_tokens**
**app_ads**
**app_decks_categories**
**app_decks_content**
**app_decks_translations**
**app_getmore**
**applications**
**blocks**
**campaign_codes**
**campaign_user**
**campaigns**
**cancellation_surveys**
**cancellation_surveys_old**
**channel_detail**
**chatlog**
**classes_addon_credits**
**classes_addon_credits_backup**
**classes_booking**
**classes_booking_backup**
**classes_booking_log**
**classes_comments**
**classes_credits**
**classes_credits_actions**
**classes_dayoff**
**classes_emails**
**classes_plan_credits**
**classes_plan_credits_backup**
**classes_teachers_availability**
**classes_teachers_availability_exceptions**
**classes_update**
**classroom_email_templates**
**classrooms**
**comments**: This table contains all comments on each lesson. Data is linked using parent_id as the ve_id on contents fields and user_id in users table.
**comments_subscriptions**
**content_dialogues**: This table contains the list of dialogue for each lesson, data is linked using a foreign key v3_id. Data consist of traditional, simplified, english and pinyin sentences.
**content_expansions**: This table contains the list of expansions for each lesson, data is linked using a foreign key v3_id. Data consist of traditional, simplified, english and pinyin sentences.
**content_grammar_tag**: This table contains the list of grammar ID’s which is linked to contents using v3_id. grammar_id can be found in the grammar_details table.
**content_rates**: This table contains the ratings on each lesson from users. Content_rates links data from contents and users by using a foreign key user_id and v3_id.
**content_tags**
**Contents**: This table contains the main content of each lesson. This also holds the old wistia video ID’s which is already replaced by S3, and links on each video are in mongo158 on lessons.new.sources collection.

**contents_free**
**contents_notes**
**contents_notes_files**
**contents_recap_ready**
**contents_series**
**contents_to_content_tags**
**continents**
**countries**
**country**
**country_db**
**course_contents**
**course_details**
**course_survey**
**creditcard_details**
**credits**
**cron_email_queue**
**currencyUSD**
**dictionary**
**dictionary_search**
**download_content**
**downloads_log**
**dvd_posts**
**email_notification_counts**
**email_queue**
**email_templates**
**error_log**
**evergage_tracking**
**faq**
**faq_categories**
**feedback_forms**
**gift_tracking**
**gifts**
**grammar_block**: This table contains the list of grammar ID’s to group each block of grammar contents. This table links to grammar_details using grammar_id.
**grammar_details**: This table contains the main grammar data.
**grammar_guide**
**grammar_sentence**: This table contains the grammar sentence usage. This table links to grammar_block using grammar_block_id.
**group_categories**
**group_contents**
**group_records**
**group_roles**
**group_student_teacher**
**group_tags**
**groups**
**groups_invite**
**groups_to_group_tags**
**grouptypes**
**help**
**help_category**
**hr_surveys**
**hsk_level_vocabulary_mapping**
**hsk_levels**
**http_referer_infos**
**http_referer_rules**
**institution_account_invoices**
**institution_account_products**
**institution_account_users**
**institution_accounts**
**institution_students**
**institutions**
**junkie_codes**
**junkie_downloads**
**junkie_products**
**lesson_evaluation**
**levels**
**link_device**
**livestream**
**location**
**log_redirect**
**logged_exceptions**
**mail_counters**
**mail_queues**
**mailing_donotcontact**
**mailing_lists**
**mailing_lists_users**
**marketing_ships**
**marketing_statements**
**marketings**
**messages**
**messages_folders**
**metatags**
**miss_content**
**motivations**
**new_email_templates**
**new_lesson_notification_users**
**new_payments**
**new_sessions**
**news**
**newsletter_send_email**
**notification_levels**
**ny_admin**
**ny_block**
**ny_file**
**ny_language**
**ny_nav_links**
**ny_page**
**ny_pagetype**
**ny_row**
**ny_session**
**oauth_access_tokens**
**oauth_authorization_codes**
**oauth_clients**
**oauth_jwt**
**oauth_refresh_tokens**
**oauth_scopes**
**oauth_users**
**offers**
**openemm_tasks**
**order_logs**
**order_type**
**orders**
**orders_additions**
**orders_to_promotions**
**org_managers**
**org_medias**
**org_students**
**org_teachers**
**organization_groups**
**organizations**
**page_dynamics**
**page_permissions**
**password_reset_tokens**
**playlist_lessons**
**playlist_studied_lessons**
**playlists**
**products**: This table contains list of products offered in the site and also contains the length of each subscriptions.
**promo_addrs**
**promo_templates**
**promos**
**promotions**
**public_decks**
**public_feed**
**record_action**
**referral_commision_plans**
**refresh_tokens**
**reg_student**
**register_device**
**report_records**
**reports**
**roles**
**sales**
**samplecourse_lessons**
**samplecourses**
**sc_medias**
**sc_pages**
**sc_sliders**
**sc_sliders_front**
**schema_migrations**
**school**
**school_assign**
**school_branch**
**school_custom_lesson**
**school_lessons**
**school_playlists**
**school_score**
**school_tchats**
**school_timeline_comments**
**school_timeline_likes**
**school_timelines**
**search_log**
**segments**
**sessions**
**short_lessons**
**sites**
**source_lists**
**sources**
**spraddr**
**states**
**study_packages**
**subscriptions**: This table contains list of users subscriptions, this also records the next billing and product info. subscriptions are created after a transaction is completed and sets the expiry date according to the purchased plan.
**suggestions**
**sz_org_staff**: This table contains list of teacher users, identified as a team in sailsJS system. linked to users table using user_id.
**sz_organizations**
**sz_student_daily_stats**
**sz_student_stats**
**sz_student_tags**
**sz_students**: This table contains list of student users, linked to users table using user_id.
**sz_tags**
**teacher_blogs**
**teachers**
**teachers_availability**
**teaching_class_reviews**
**teaching_classes**
**team_directory**
**temp**
**temp_acceptance**
**temp_active_since_jan_sunscriberss**
**temp_affiliates**
**temp_all_users_ca**
**temp_all_users_us**
**temp_all_users_us_one**
**temp_final_jackusers**
**temp_http_referrers**
**temp_june_paid_referrers**
**temp_jacksonville_subscribers**
**temp_june_paid_referrers**
**temp_june_paid_referrersp**
**temp_june_paid_referrerst**
**temp_june_referrers**
**temp_london_users**
**temp_london_users_one**
**temp_mailchimp_subscribers**
**temp_may_paid_referrers**
**temp_may_referrers**
**temp_new_jacksonville_subscribers**
**temp_organizations**
**temp_referrals**
**temp_subscribers_us**
**temp_tracking_login_ca**
**temp_tracking_login_us**
**temp_tracking_login_us_one**
**temp_user_chars_mapping**
**temp_useremail_ca**
**temp_vouchers_export**
**term_class**
**terms**
**terms_user_acceptance**
**timezone**
**token**
**tracking_login**
**transactions**: This table contains list of customers transaction and links to customers subscription record
**transaction_address**: This table contains list of transaction addresses, address are fetch from checkout form
**transaction_logs**: This table contains list of transaction logs, records transactions status either success, denied or any error while making the transaction.
**transaction_gifts**

**user_actions**: This table contains list of user actions from lesson page, this records the users action like adding vocabulary word
**user_action_type**: This table contains list of action type, this linked to user_actions table using user_id as an identifier.
**user_activities**
**user_addresses**: This table contains user address.
**user_apps**
**user_bank_accounts**
**user_bounced_emails**
**user_campaigns**
**user_contents**: This table contains list of users studied and bookmarked lessons.
**user_contents_assign**
**user_contents_category**
**user_course_contents**: This table contains list of users lessons with course.
**user_course_score**
**user_courses**: This table contains list of users courses.
**user_custom_assessments**
**user_daily_stats**: This table contains list of users progress on each lesson and records the average score from exercises.
**user_evaluation**
**user_feeds**
**user_groups**: This table contains list of user group id and which user role.
**user_http_referer**
**user_lesson_assignments**
**user_level_test**: This table contains users test levels
**user_listening_tests**
**user_log**: This table contains users logs, this records which page users visited
**user_notes**
**user_notification_tokens**
**user_notifications**
**user_oauth_consumers**
**user_oauth_tokens**
**user_options**: This table contains user options like level, interests weekly goals, table links to users using user_id.
**user_placements**
**user_post_tags**
**user_posts**
**user_post_files**
**user_posts_to_user_post_tags**
**user_preferences**: This table contains list of users preferences, this records the users last login and login times. data is linked to users table using user_id.
**user_prepares**
**user_purchase_expires**
**user_referral_commisions**
**user_referrals**
**user_refunds**
**user_relationships**
**user_settings**: This table contains users settings, saved data are unserialized
**user_settings_token**
**user_shipping_info**
**user_site_links**: This table contains user settings includes subscription expiry date.
**user_studying_data**
**user_subscribed**
**user_trial_classes**
**user_tweet_question_type**
**user_tweets**
**user_tweets_to_twitter_tweets**
**user_twitter_settings**
**user_vocabulary**
**user_vocabulary_concentration**
**user_vocabulary_to_vocabulary_tags**
**users**: This table contains the main content of each user. This also holds the users last seen set in field admin_note which is unix value. 'ltv' and 'ltsm' fields are still under investigation on how this fields works.
**usertypes**: This table contains user types like 'premium', this table is a reference table from users which is linked using foreign key in users table usertype_id.
**vocabulary**: This table contains the list of vocabulary for each lesson, data is linked using a foreign key v3_id and data are separated from vocabulary_class ‘Key Vocabulary’ or ‘Supplementary’. Data consist of traditional, simplified, english and pinyin words.
**vicabulary_for_search**
**vocabulary_recordings**
**vocabulary_tags**
**voucher_tags**
**voucher_amounts**
**voucher_campaigns**
**voucher_codes**
**voucher_credits**
**wechat_payments**
**welcome_posts**
**zone**

**wp_commentmeta**
**wp_comments**
**wp_links**
**wp_options**
**wp_popularpostsdata**
**wp_popularpostssummary**
**wp_postmeta**
**wp_posts**
**wp_term_relationships**
**wp_term_taxonomy**
**wp_termmeta**
**wp_terms**
**wp_usermeta**
**wp_users**
**wp_userstats_count**
**wp_wpsd_trends**








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

## ChinesePod Users Collection
Reconstruct users data from mysql to mongo database

### MYSQL USERS TABLES ###

**Users**: This table contains list of CRM users, table is under chinesepod2015 database.

**users**: This table contains the main content of each user. This also holds the users last seen set in field admin_note which is unix value. 'ltv' and 'ltsm' fields are still under investigation on how this fields works.

**usertypes**: This table contains user types like 'premium', this table is a reference table from users which is linked using foreign key in users table usertype_id.

**user_site_links**: This table contains user settings includes subscription expiry date.

**user_options**: This table contains user options like level, interests weekly goals, table links to users using user_id.

**sz_students**: This table contains list of student users, linked to users table using user_id.

**sz_org_staff**: This table contains list of teacher users, identified as a team in sailsJS system. linked to users table using user_id.

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

## ChinesePod Orders Collection
Reconstruct orders data from mysql to mongo database

### MYSQL USERS TABLES ###
**orders**: This table contains list of order data from customers, table is under chinesepod_production database and this is table reference to other mysql tables such as transactions, users, products and products from old database "chinesepod_2015".

**transactions**: This table contains list of customers transaction and links to customers subscription record

**transaction_address**: This table contains list of transaction addresses, address are fetch from checkout form

**transaction_logs**: This table contains list of transaction logs, records transactions status either success, denied or any error while making the transaction.

**subscriptions**: This table contains list of users subscriptions, this also records the next billing and product info. subscriptions are created after a transaction is completed and sets the expiry date according to the purchased plan.

**products**: This table contains list of products offered in the site and also contains the length of each subscriptions.
