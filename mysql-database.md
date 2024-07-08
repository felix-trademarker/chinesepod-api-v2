### MYSQL TABLES ###
## chinesepod_production ##

**USD_exchange_rates**: List of USD conversion rates, not sure if this is updated or used in the current system.

**access_academic_codes**: list of access codes used for selected admin users

**access_voucher_codes**: list of voucher codes with expiry status, last update 2020 by Ugis

**affiliate_details**: This stores all affiliated users.

**affiliate_events**: This records all users events and links to users and affiliated users.

**affiliate_invoices**: list of users generated invoices.

**affiliate_log**: Log affiliate invites and records the origin.

**api_clients**: list of client id and secret keys.

**api_custom**: list of set of query strings.

**api_log**: PHP api logs, stores the access token used and which current user is logged in.

**api_tokens**: list of access tokens used in IOS and andriod APP.

**campaigns**: List of campaigns with code and notes.

**cancellation_surveys**: list of product cancellation includes notes and reason.

**channel_detail**: List of lesson channels and identified using product ID

**classes_booking**: List of bookings from students to selected teachers

**classes_booking_emaillog**: booking status linked with booking ID

**classes_comments**: booking comments linked via booking ID and user ID

**classes_credits**: Class information, stores time and expiration date and its status either free or paid

**classes_credits_actions**: List of action descriptions

**classes_dayoff**: List of teachers dayoff, recorded with unix timestamp

**classes_emails**: List of recorded sent emails regarding the class

**classes_plan_credits**: Class credits indicates the expiration dates and which teacher and student in each class

**classes_teachers_availability**: List of teachers available day and time

**classroom_email_templates**: email templates with subject and contents

**classrooms**: List of assigned teacher and which course of lessons and which organization it belongs to.

**comments**: This table contains all comments on each lesson. Data is linked using parent_id as the ve_id on contents fields and user_id in users table.

**comments_subscriptions**: Identifies the users which topic it added comments and settings if user needs to be notified.

**content_dialogues**: This table contains the list of dialogue for each lesson, data is linked using a foreign key v3_id. Data consist of traditional, simplified, english and pinyin sentences.

**content_expansions**: This table contains the list of expansions for each lesson, data is linked using a foreign key v3_id. Data consist of traditional, simplified, english and pinyin sentences.

**content_grammar_tag**: This table contains the list of grammar ID’s which is linked to contents using v3_id. grammar_id can be found in the grammar_details table.

**content_rates**: This table contains the ratings on each lesson from users. Content_rates links data from contents and users by using a foreign key user_id and v3_id.

**content_tags**: List of tags for each lesson, identified using id as a reference in table `contents_to_content_tags`.

**Contents**: This table contains the main content of each lesson. This also holds the old wistia video ID’s which is already replaced by S3, and links on each video are in mongo158 on lessons.new.sources collection.

**contents_free**: list of free lesson ID's.

**contents_notes**: List of lesson notes

**contents_series**: Lesson series with levels

**contents_to_content_tags**: List of tags for each lesson, linked tables `contents` and `content_tags` using ID as a reference.

**continents**: List of continents for referrence

**countries**: List of countries with ISO formats and country full names

**country**: List of country code and name

**country_db**: List of countries with ISO formats, country full names, and phone code

**course_contents**: List of lessons with assigned course

**course_details**: Course information list

**currencyUSD**: Currency rates

**dictionary**: List of dictionary words and times of checked

**dictionary_search**: List of searched dictionary and determines which user searched which word

**email_notification_counts**: Record number of email confirmation sent to user, currently used in sailsJS

**email_templates**: System email tamplates and formats

**faq**: FAQ contents, used in sailsJS

**feedback_forms**: Hold the feedback experience from users, active table.

**gift_tracking**: Records the gift labels printed and sent to users.

**grammar_block**: This table contains the list of grammar ID’s to group each block of grammar contents. This table links to grammar_details using grammar_id.

**grammar_details**: This table contains the main grammar data.

**grammar_sentence**: This table contains the grammar sentence usage. This table links to grammar_block using grammar_block_id.

**groups**: List of lesson groups and identify its level

**link_device**: list of code linked to users using andriod app. tables seems newly created, first data was added May 29, 2024.

**log_redirect**: users logs when they are redirected

**mailing_donotcontact**: Users who op-out or unsubscribe from mailing

**mailing_lists**: List of type of mailing list

**mailing_lists_users**: opt-in users from mailing

**marketings**: Mailing templates for marketing 

**metatags**: List of set metatags per page name

**motivations**: List of users possible interest or motivations

**new_email_templates**: Mailing templates

**ny_admin**: Dynamic admin variables, not sure but it seems PHP is using this values. 

**ny_page**: List of pages, not sure how it was used.

**ny_pagetype**: Type of ny pages

**ny_session**: saved sessions used in Andriod and IOS APP

**password_reset_tokens**: list of users tokens used to reset password.

**playlist_studied_lessons**: from old system, marked the playlist lesson as studied.

**products**: This table contains list of products offered in the site and also contains the length of each subscriptions.

**promotions**: List of promo codes with promo expiry dates, currently used in system

**refresh_tokens**: users refresh tokens for login auth

**roles**: List of user roles

**school**: List of schools, this includes chinesepod

**search_log**: list of word searches.

**sessions**: List of users sessions 

**short_lessons**: Short lessons used in PHP site

**sites**: List of sites, this includes the chinesepod.com, site ID is used to determine which account affiliated to which site.

**source_lists**: List of app sources sites or app

**sources**: list of social media sites

**subscriptions**: This table contains list of users subscriptions, this also records the next billing and product info. subscriptions are created after a transaction is completed and sets the expiry date according to the purchased plan.

**sz_org_staff**: This table contains list of teacher users, identified as a team in sailsJS system. linked to users table using user_id.

**sz_organizations**: List of organizations, this includes chinesepod LLC

**sz_student_daily_stats**: This records all users daily stats

**sz_student_stats**: This records each users stats

**sz_student_tags**: list of student tags, linked using tag ID

**sz_students**: This table contains list of student users, linked to users table using user_id.

**sz_tags**: list of student tags

**teaching_classes**: classes statuses and point which teacher and student using users table

**team_directory**: Team directory, stored team information

**term_class**: term and condition type

**terms**: terms contents depends on each term class

**terms_user_acceptance**: terms acceptance records

**timezone**: List of timezone with zone ID's

**token**: List of user tokens and its validity

**tracking_login**: users tracking login with user agents

**transactions**: This table contains list of customers transaction and links to customers subscription record

**transaction_address**: This table contains list of transaction addresses, address are fetch from checkout form

**transaction_logs**: This table contains list of transaction logs, records transactions status either success, denied or any error while making the transaction.

**transaction_gifts**: record of gift sent to users

**user_actions**: This table contains list of user actions from lesson page, this records the users action like adding vocabulary word

**user_action_type**: This table contains list of action type, this linked to user_actions table using user_id as an identifier.

**user_activities**: record users activities, used in old system

**user_addresses**: This table contains user address.

**user_bounced_emails**: list of emails bounced

**user_campaigns**: List of user campaigns

**user_contents**: This table contains list of users studied and bookmarked lessons.

**user_course_contents**: This table contains list of users lessons with course.

**user_courses**: This table contains list of users courses.

**user_daily_stats**: This table contains list of users progress on each lesson and records the average score from exercises.

**user_feeds**: users feeds with serialized data

**user_groups**: This table contains list of user group id and which user role.

**user_lesson_assignments**: user assigned to check each lesson, used in old system.

**user_level_test**: This table contains users test levels

**user_listening_tests**: user listening test results, used in old system.

**user_log**: This table contains users logs, this records which page users visited

**user_notes**: user notes from CS Agents

**user_notification_tokens**: users notification per device tokens, not sure if used in app.

**user_notifications**: notification messages for users, used in old system

**user_oauth_consumers**: app keys and secret keys

**user_oauth_tokens**: app consumer oauth key and secret keys

**user_options**: This table contains user options like level, interests weekly goals, table links to users using user_id.

**user_placements**: list of users taken lessons questions

**user_post_tags**: list of common tags for forums or community page

**user_posts**: user created post, not sure where content is used

**user_post_files**: user post file attachments

**user_posts_to_user_post_tags**: list of users post tags, content is linked via `user_post_tags` and `user_posts`

**user_preferences**: This table contains list of users preferences, this records the users last login and login times. data is linked to users table using user_id.

**user_referral_commisions**: list of user referrals linked with commision plan and users ID 

**user_referrals**: Record of users referred to join chinesepod

**user_settings**: This table contains users settings, saved data are unserialized

**user_shipping_info**: users shipping details

**user_site_links**: This table contains user settings includes subscription expiry date.

**user_studying_data**: contact details and schedule for lessons. Used in old system 

**user_subscribed**: List of user who subscribe to a lessons

**user_vocabulary**: Users visited vocabulary or studied

**user_vocabulary_concentration**: empty table

**user_vocabulary_to_vocabulary_tags**: Link users vocabulary to vocabulary tags using ID

**users**: This table contains the main content of each user. This also holds the users last seen set in field admin_note which 
is unix value. 'ltv' and 'ltsm' fields are still under investigation on how this fields works.

**usertypes**: This table contains user types like 'premium', this table is a reference table from users which is linked using 
foreign key in users table usertype_id.

**vocabulary**: This table contains the list of vocabulary for each lesson, data is linked using a foreign key v3_id and data are separated from vocabulary_class ‘Key Vocabulary’ or ‘Supplementary’. Data consist of traditional, simplified, english and pinyin words.

**vicabulary_for_search**: set of vocabularies identified using vocabulary class

**vocabulary_recordings**: vocabulary audio records this includes the audio links and descriptions

**vocabulary_tags**: tags or key word for vocabulary from user

**wechat_payments**: record of wechat payments

**welcome_posts**: welcome contents for each teachers

**zone**: List of country zones


__Below tables has no models found in the current system or unknown usage.__
<hr>

**abtest_data**: test data for model views, not used in the current system.

**abtest_orders**: list of order ID's, data last entry was last 2013.

**abtest_plans**: list of user plans, last entry was last 2011, not used in the current system.

**ads**: list of image url used in ads

**ages**: age brackets.

**app_ads**: ??

**app_decks_categories**: List of category names 

**app_decks_content**: List of app content details linked with category ID and identified by type ID 

**app_decks_translations**: ??

**app_getmore**: empty table

**applications**: List of Web Apps including chinesepod.com 

**blocks**: ??

**campaign_codes** List of generated codes, not sure how this is used in the system.

**campaign_user**: List of users that uses "cid (campaign)" code when signup.

**chatlog**: List of chat logs from users, with logs starting in 2017 and ending in 2018. Not sure which app was used.

**classes_addon_credits**: ??

**classes_teachers_availability_exceptions**: ??

**classes_update**: ??

**course_survey**: contains only 10 records, possible only test table.

**creditcard_details**: captured credit card records

**credits**: Purchased credits from users, used in old system.

**cron_email_queue**: empty table

**contents_notes_files**: lesson notes attachments from old system.

**contents_recap_ready**: ??

**download_content**: empty table

**downloads_log**: Log users downloaded file, used in old system, no data current updates.

**dvd_posts**: list of users address and which product it purchased. used in old system. Data last update was last 2009.

**email_queue**: empty table

**error_log**: empty table

**evergage_tracking**: ??

**faq_categories**: Faq categories, not sure how data is currently used.

**gifts**: contains only 1 record, not sure how the data is being used.

**grammar_guide**: ??

**group_categories**: Group categories details, not sure how it was used in the sailsJS

**group_contents**: Set of lesson groups

**group_records**: ??, this must be used in the old system.

**group_roles**: user roles in a group.

**group_student_teacher**: Identifies which student and teacher in each group

**group_tags**: list of tags in each group

**groups_invite**: record of all group invites from each user

**groups_to_group_tags**: Link group and group tags via ID's

**grouptypes**: group types, channel, class, or community

**help**: Contains questions and guide with possible encountered problems.

**help_category**: Help categories.

**hr_surveys**: users assisstment records.

**hsk_level_vocabulary_mapping**: contains vocabulary and pinyin for each lesson

**hsk_levels**: contains words and translations

**http_referer_infos**: contains site referrers, last update was last 2013

**http_referer_rules**: list of domains and names, not sure how it was used in the old system.

**institution_account_invoices**: ??

**institution_account_products**: ??, empty table

**institution_account_users**: ??, empty table

**institution_accounts**: ??

**institution_students**: ??

**institutions**: List of schools registered in the system

**junkie_codes**: Not used in system.

**junkie_downloads**: Not used in system.

**junkie_products**: Not used in system.

**lesson_evaluation**: Not used in system.

**levels**: List of user levels

**livestream**: Not used in system.

**location**: List of locations with latlang fields, not sure if this table is used in the new system.

**logged_exceptions**: Not used in system.

**mail_counters**: Not used in system.

**mail_queues**: Not used in system.

**marketing_ships**: Not used in system.

**marketing_statements**: Not used in system.

**messages**: Not sure if this is still used in system. last data update since 2015

**messages_folders**: ??

**miss_content**: empty table.

**new_lesson_notification_users**: empty table

**new_payments**: ??

**new_sessions**: ??

**news**: not used in system.

**newsletter_send_email**: empty table

**notification_levels**: ??

**ny_block**: ??

**ny_file**: ??

**ny_language**: ??

**ny_nav_links**: ??

**ny_row**: ??

**oauth_access_tokens**: list of generated tokens per user, not used in current system, last entry was last 2014.

**oauth_authorization_codes**: empty table

**oauth_clients**: only test accounts are saved

**oauth_jwt**: empty table

**oauth_refresh_tokens**: not used, only test data

**oauth_scopes**: empty table

**oauth_users**: ??

**offers**: ??

**openemm_tasks**: ??

**order_logs**: Order logs, used in old system, last entry was last 2014

**order_type**: Order types(New, Renewal) used in old system

**orders**: List of users orders, From old system. used in old system

**orders_additions**: used in old system

**orders_to_promotions**: used in old system

**org_managers**: not sure how and where it was used in the current and old system.

**org_medias**: not sure how and where it was used in the current and old system.

**org_students**: not sure how and where it was used in the current and old system.

**org_teachers**: not sure how and where it was used in the current and old system.

**organization_groups**: not sure how and where it was used in the current and old system.

**organizations**: not sure how and where it was used in the current and old system.

**page_dynamics**: not used, only test data

**page_permissions**: not used, only test data

**playlist_lessons**: say it right lessons, but current system is using a json file with a list of say it right lessons. must be used in old system.

**playlists**: not used, only test data

**promo_addrs**: used in old system, last entry was last 2010

**promo_templates**: email templates, used in old system or only test data.

**promos**: promo codes, only test data or used in old system.

**public_decks**: Not used. only test data

**public_feed**: list of v3_id, not sure how it was used in the system.

**record_action**: empty table

**referral_commision_plans**: empty table

**reg_student**: List of students, not sure how this is used in the system

**register_device**: empty table

**report_records**: currently used in system, not sure how it was used

**reports**: not used, last entry was last 2011

**sales**: order records from users, currently not used in system, last recorded was last 2011

**samplecourse_lessons**: test data

**samplecourses**: test data

**sc_medias**: list of image paths from users, only test data

**sc_pages**: empty table

**sc_sliders**: ??

**sc_sliders_front**: ??

**schema_migrations**: ??

**school_assign**: only test data, implementation might be not finished

**school_branch**: only test data, implementation might be not finished

**school_custom_lesson**: only test data, implementation might be not finished

**school_lessons**: only test data, implementation might be not finished

**school_playlists**: only test data, implementation might be not finished

**school_score**: only test data, implementation might be not finished

**school_tchats**: only test data, implementation might be not finished

**school_timeline_comments**: only test data, implementation might be not finished

**school_timeline_likes**: only test data, implementation might be not finished

**school_timelines**: only test data, implementation might be not finished

**segments**: ??

**spraddr**: empty table

**states**: List of US states, not sure how this data used in site

**study_packages**: List of users current packages, last entry was last 2011.

**suggestions**: users suggestions, last entry was last 2013

**teacher_blogs**: empty table

**teachers**: empty table

**teachers_availability**: empty table

**teaching_class_reviews**: teachers reviews from students, used in old system

**temp**: test data, not used in site

**temp_acceptance**: test data, not used in site

**temp_active_since_jan_sunscriberss**: test data, not used in site

**temp_affiliates**: test data, not used in site

**temp_all_users_ca**: test data, not used in site

**temp_all_users_us**: test data, not used in site

**temp_all_users_us_one**: test data, not used in site

**temp_final_jackusers**: test data, not used in site

**temp_http_referrers**: test data, not used in site

**temp_june_paid_referrers**: test data, not used in site

**temp_jacksonville_subscribers**: test data, not used in site

**temp_june_paid_referrers**: test data, not used in site

**temp_june_paid_referrersp**: test data, not used in site

**temp_june_paid_referrerst**: test data, not used in site

**temp_june_referrers**: test data, not used in site

**temp_london_users**: test data, not used in site

**temp_london_users_one**: test data, not used in site

**temp_mailchimp_subscribers**: test data, not used in site

**temp_may_paid_referrers**: test data, not used in site

**temp_may_referrers**: test data, not used in site

**temp_new_jacksonville_subscribers**: test data, not used in site

**temp_organizations**: test data, not used in site

**temp_referrals**: test data, not used in site

**temp_subscribers_us**: test data, not used in site

**temp_tracking_login_ca**: test data, not used in site

**temp_tracking_login_us**: test data, not used in site

**temp_tracking_login_us_one**: test data, not used in site

**temp_user_chars_mapping**: test data, not used in site

**temp_useremail_ca**: test data, not used in site

**temp_vouchers_export**: test data, not used in site

**user_apps**: record which app users used, last record was last 2011. 

**user_bank_accounts**: not used, test data only

**user_contents_assign**: not used, last records was last 2010

**user_contents_category**: not used, last records was last 2012

**user_course_score**: not used, last records was last 2011

**user_custom_assessments**: not used, last records was last 2011

**user_evaluation**: not used, last records was last 2011

**user_http_referer**: empty table

**user_prepares**: list of users info, not used in current site, last update was last 2013.

**user_purchase_expires**: User settings to identify users access types and expiry of subscription, used in old system. last data recorded was last 2013.

**user_refunds**: test data only

**user_relationships**: user to user relations, determine to block user or not, used in old system, last record was last 2012.

**user_settings_token**: from old system, last record was last 2010

**user_trial_classes**: Trail classes, only test data.

**user_tweet_question_type**: List of common questions, no new data. not sure if this is used in site.

**user_tweets**: user tweet contents, last record was last 2010.

**user_tweets_to_twitter_tweets**: linked to twitter using twitter id and tweet id

**user_twitter_settings**: List of users twitter accounts and settings

**voucher_amounts**: list of users ID with amounts, no new data last records was last 2013

**voucher_campaigns**: list of user campaign with voucher codes and expiry date, last update was last 2012

**voucher_codes**: List of voucher codes last record was last 2012

**voucher_credits**: List of claimed vouchers, last record was last 2013

## Below tables are used in wordpress/blog ##

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

<hr>

## chinesepod_logging ##

**affiliate_logs**: affilaites log records the site referrers and which affiliated user. record includes IP addresses and country.

**cp_accesslogs**: Logs all URL and referrer URL.

**email_logs**: Log all sent system automated emails.

**error_log**: Logs all errors from a device, current errors are from andiod app.

**game_log**: charactercrush logs, records time spent and points. 

**lesson_logs**: log users visited lessons.

**lesson_tracks**: track users lessons and progress, this also identifies which device users used.

**not_found_logs**: log not found page URL and user agents.

__Below tables has no models found in the current system__
<hr>

**asn_logs**: ??. not sure where records are from and last record was last 2021.

**custom_logs**: only a test table. 

**ip2location_db9**: ??

**mautic_error_logs**: Mautic error logs, last record was last 2020. not sure if this table still used in the system.

**temp_london_subscribers**: List of all login from london, records only time and email address. last record was last 2018. not sure if this is still used in the current system.

**temp_london_subscribers_one**: List of all login from london, records only time and email address. last record was last 2018. not sure if this is still used in the current system.

<hr>

## assessment ##

**assessment_details**: List of assessments and its matching questions using ID's.

**assessments**: List of lessons assessments.

**results**: Records of all assessment results taken by the user.

**type**: Assessment types

**user_assessments**: users taken assessments with recorded lesson and score.

**questions**: Set of questions per lessons identified using scope field.

__Below tables are no longer used in the current system__
<hr>

**course_require**: List of lessons with course from a teacher and students. last record was last 2012. not sure if this is still used in the system.

**employees**: test table only. last record was last 2010.

**logs**: empty table.

**question_type**: empty table.

**results_answers**: ??

**roles**: user roles, only test data.

**schedules**: class schedules, last records was 2011. not used in the current system.

**settings**: ??

**student_list**: empty table.

**users**: Old user records.

<hr>

## chinesepod_2015 ##

**Products**: List of all products/subscriptions offered.

**Promotions**: List of old promo codes

**Users**: Used in the current system. List of admin users.

**Vouchers**: List of old Vouchers.

__Below tables are no longer used in the current system__
<hr>

**Blog_comments**: Not used in the current system.

**Blogposts**: Not used in the current system.

**Channel_settings**: Not used in the current system.

**Channels**: Not used in the current system.

**Courses**: Not used in the current system.

**Inventory_Item_History**: Not used in the current system.

**Inventory_Items**: Not used in the current system.

**Markets**: Not used in the current system.

**Product_Extras**: Not used in the current system.

**Product_History**: Not used in the current system.

**Product_Option_Extras**: Not used in the current system.

**Product_Options**: Not used in the current system.

**Product_Promotions**: Not used in the current system.

**Product_Tags**: Not used in the current system.

**Product_Types**: Not used in the current system.

**Store_Banner_Settings**: Not used in the current system.

**Store_Banner_Types**: Not used in the current system.

**Store_Blogs**: Not used in the current system.

**Store_Feature_Banners**: Not used in the current system.

**Store_Feature_Block_types**: Not used in the current system.

**Store_Feature_Blocks**: Not used in the current system.

**Store_Feature_Products**: Not used in the current system.

**Store_Features**: Not used in the current system.

**Tags**: Not used in the current system.

**User_Action_Summary**: Not used in the current system.

**User_Activities**: Not used in the current system.

**User_Browsers**: Not used in the current system.

**User_Carts**: Not used in the current system.

**User_Follows**: Not used in the current system.

**User_Language**: Not used in the current system.

**User_Linked_Accounts**: Not used in the current system.

**User_Notifications**: Not used in the current system.

**User_Profile**: Not used in the current system.


********************* FINAL NA JUD NI **********************
* When                  : July 7, 2024                     *
* Where                 : Vaño Beach, Lapu Lapu            *
* Coaster Departure Time: 7:30am                           *
* Assemble Time         : 7:00am                           *
* Meeting place         : Nasipit Talamban (Shell Station) *
* Food and Drinks       : KKB / BYOP                       *
* What to WEAR?         : Any basta white upper            *
************************************************************


