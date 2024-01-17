let _table = "users";
var Model = require('./_model158')
var defaultModel = new Model(_table)

let conn = require('../config/DbConnect');

// module.exports = { baseModel.get }
module.exports = {

    // BASE FUNCTIONS LOCATED IN defaultModel
    count : async function() {
        return await defaultModel.count()
    },
    get : async function() {
        return await defaultModel.get()
    },
    find : async function(id) {
        return await defaultModel.find(id)
	},
	findQuery : async function(query) {
        return await defaultModel.findQuery(query)
    },
    paginate : async function(skip,limit) {
        return await defaultModel.paginate(skip,limit)
	},
	update : async function(id,data) {
        return await defaultModel.update(id,data)
    },
	put : async function(data) {
        return await defaultModel.put(data)
    },
    upsert : async function(query, data) {
        return await defaultModel.upsert(query, data)
	},
	remove : async function(id) {
        return await defaultModel.remove(id)
    },
    removeFields : async function(id,query) {
        return await defaultModel.removeFields(id,query)
    },

    // CUSTOM MYSQL QUERY BELOW ========================
    // ==================================================

	getMysqlProduction : async function(query){
        return await defaultModel.getMysql(conn.getDbMySqlProduction(),query)
    },
    
    getMysqlLogging : async function(query){
        return await defaultModel.getMysql(conn.getDbMySqlLogging(),query)
    },
    
    getMysql2015 : async function(query){
        return await defaultModel.getMysql(conn.getDbMySql2015(),query)
    },
    
    // ADD CUSTOM FUNCTION BELOW ========================
    // ==================================================


    getUserByEmailSQL : async function(email){
        // return new Promise(function(resolve, reject) {
            var sql = "SELECT * FROM " + _table
            sql += " WHERE email='" + email+"'"
            return await defaultModel.getMysql(conn.getDbMySqlProduction(),sql)
        // });
    },

    getUserByIdSQL : async function(id){
        // return new Promise(function(resolve, reject) {
        var sql =   `SELECT
                        id, 
                        username, 
                        email, 
                        code as hashCode, 
                        name,
                        nationality,
                        country,
                        city,
                        avatar_url as avatarUrl,
                        interests,
                        skyper,
                        sex,
                        birthday,
                        mailing_address1 as mailingAddress1,
                        mailing_address2 as mailingAddress2,
                        mailing_city as mailingCity,
                        mailing_state as mailingState,
                        mailing_country as mailingCountry,
                        mailing_postal_code as mailingPostalCode,
                        mobile_phone as mobileNumber,
                        credit_amount as creditAmount
                    FROM ${tableName}
                    WHERE id=${id}`;
        return await defaultModel.getMysql(conn.getDbMySqlProduction(),sql)
        // });
    },

    searchUser : async function(id){
        // return new Promise(function(resolve, reject) {

            let cond = `username='${id}'
                        OR email='${id}'`
            if (!isNaN(id))
                cond = `id='${id}'`

            var sql =   `SELECT
                            id, 
                            username, 
                            email, 
                            code as hashCode, 
                            name,
                            nationality,
                            country,
                            city,
                            avatar_url as avatarUrl,
                            interests,
                            skyper,
                            sex,
                            birthday,
                            mailing_address1 as mailingAddress1,
                            mailing_address2 as mailingAddress2,
                            mailing_city as mailingCity,
                            mailing_state as mailingState,
                            mailing_country as mailingCountry,
                            mailing_postal_code as mailingPostalCode,
                            mobile_phone as mobileNumber,
                            credit_amount as creditAmount
                        FROM ${tableName}
                        WHERE ${cond}
                        LIMIT 1
                        `;
            // conn.query(sql, function (err, result) {
            //     if (err) reject(err);

            //     resolve(result)
            // });
            return await defaultModel.getMysql(conn.getDbMySqlProduction(),sql)
        // });
    },

    getUserBySession : async function(sesIs){
        // return new Promise(function(resolve, reject) {
            var sql = "SELECT u.* FROM sessions AS s"
            sql += " LEFT JOIN users AS u"
            sql += " ON s.session_user_id=u.id"
            sql += " WHERE session_id='" + sesIs+"'"
            // conn.query(sql, function (err, result) {
            //     if (err) reject(err);

            //     resolve(result)
            // });

            return await defaultModel.getMysql(conn.getDbMySqlProduction(),sql)
        // });
    },

    // GET USER COURSE
    getUserCourse : async function(id){
        // return new Promise(function(resolve, reject) {
            var sql = `SELECT
                        c.course_id as courseId, 
                        c.course_title as title, 
                        c.channel_id as channelId, 
                        c.type as type, 
                        c.course_introduction as introduction, 
                        c.course_hightlight as hightlight, 
                        c.course_image as image, 
                        c.level_id as levelId, 
                        c.course_type as type, 
                        c.hash_code as code
                        FROM course_detail AS c
                        LEFT JOIN user_courses AS uc
                        ON uc.course_id = c.course_id
                        WHERE uc.user_id=${id}`
            // conn.query(sql, function (err, result) {
            //     if (err) reject(err);

            //     resolve(result)
            // });

            return await defaultModel.getMysql(conn.getDbMySqlProduction(),sql)
        // });
    },

    getUserAddress : async function(id){
        // return new Promise(function(resolve, reject) {
            var sql = "SELECT * FROM user_addresses"
            sql += " WHERE user_id='" + id+"'"
            // conn.query(sql, function (err, result) {
            //     if (err) reject(err);

            //     resolve(result)
            // });

            return await defaultModel.getMysql(conn.getDbMySqlProduction(),sql)
        // });
    },

    getUserShippingInfo : async function(id){
        // return new Promise(function(resolve, reject) {
            var sql = "SELECT * FROM user_shipping_info"
            sql += " WHERE user_id='" + id+"'"
            conn.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });

            return await defaultModel.getMysql(conn.getDbMySqlProduction(),sql)
        // });
    },

    getUserContents : async function(id){
        // return new Promise(function(resolve, reject) {
            var sql = "SELECT c.title, c.v3_id as lessonId, uc.status FROM contents c"
            sql += " LEFT JOIN user_contents AS uc"
            sql += " ON uc.v3_id = c.v3_id"
            sql += " WHERE uc.user_id='" + id+"'"
            sql += " AND uc.status <> ''"
            conn.query(sql, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });

            return await defaultModel.getMysql(conn.getDbMySqlProduction(),sql)
        // });
    },

    getUserOptions : async function(id){
        // return new Promise(function(resolve, reject) {
            var sql = "SELECT option_key as optionKey, option_value as optionValue FROM user_options"
            sql += " WHERE user_id='" + id+"'"
            // conn.query(sql, function (err, result) {
            //     if (err) reject(err);

            //     resolve(result)
            // });

            return await defaultModel.getMysql(conn.getDbMySqlProduction(),sql)
        // });
    },

    getUserSettings : async function(id){
        // return new Promise(function(resolve, reject) {
            var sql = `SELECT 
                        id,
                        updated_at as updatedAt, 
                        setting as setting, 
                        im_type as imType, 
                        im_address as imAddress, 
                        im_status as imStatus, 
                        subscribe_status as subscribeStatus, 
                        first_show as firstShow, 
                        autoplay_sec as autoplaySec, 
                        dashboard_tip as dashboardTip, 
                        group_tip as groupTip
                        FROM user_settings
                        WHERE user_id=${id}`
            // conn.query(sql, function (err, result) {
            //     if (err) reject(err);

            //     resolve(result)
            // });

            return await defaultModel.getMysql(conn.getDbMySqlProduction(),sql)
        // });
    },

    getUserVocabulary : async function(id){
        // return new Promise(function(resolve, reject) {
            var sql = "SELECT v.vocabulary_class as vocabularyClass, v.column_1 as simplified, v.column_2 as pinyin, v.column_3 as english, v.column_4 as traditional, v.audio, v.v3_id as v3Id, v.display_order as displayOrder, v.image, vt.id as tagId ,vt.tag FROM vocabulary v"
            sql += " LEFT JOIN user_vocabulary AS uv"
            sql += " ON uv.vocabulary_id = v.id"
            sql += " LEFT JOIN user_vocabulary_to_vocabulary_tags AS uvtvt"
            sql += " ON uv.vocabulary_id = uvtvt.user_vocabulary_id"
            sql += " INNER JOIN vocabulary_tags AS vt"
            sql += " ON vt.id = uvtvt.vocabulary_tag_id"
            sql += " WHERE uv.user_id='" + id+"'"
            // conn.query(sql, function (err, result) {
            //     if (err) reject(err);

            //     resolve(result)
            // });
            return await defaultModel.getMysql(conn.getDbMySqlProduction(),sql)
        // });
    },

    getUserSubscriptions : async function(id){
        // return new Promise(function(resolve, reject) {
        var sql = `SELECT 
                    subscription_id as subscriptionId,
                    subscription_from as subscriptionFrom,
                    subscription_type as subscriptionType,
                    is_old as isOld,
                    product_id as productId,
                    product_length as productLength,
                    status,
                    receipt,
                    date_cancelled as dateCancelled,
                    date_created as dateCreated,
                    next_billing_time as nextBillingTime,
                    last_modified as lastModified,
                    cc_num as ccNum,
                    cc_exp as ccExp,
                    paypal_email as paypalEemail
                    FROM subscriptions
                    WHERE user_id=${id}
                    ORDER BY dateCreated DESC`
        return await defaultModel.getMysql(conn.getDbMySqlProduction(),sql)
        // });
    },

    getUserPost : async function(id){
        // return new Promise(function(resolve, reject) {
            var sql = `SELECT
                        id, 
                        content, 
                        created_at as createdAt, 
                        published, 
                        title, 
                        is_draft as isDraft, 
                        last_comment_id as lastCommentId, 
                        last_comment_time as lastCommentTime, 
                        group_id as groupId 
                        FROM user_posts
                        WHERE user_id=${id}`
            // conn.query(sql, function (err, result) {
            //     if (err) reject(err);

            //     resolve(result)
            // });

            return await defaultModel.getMysql(conn.getDbMySqlProduction(),sql)
        // });
    },

    getUserPostTags : async function(id){
        // return new Promise(function(resolve, reject) {
            var sql = "SELECT upt.tag FROM user_posts_to_user_post_tags ptu"
            sql += " LEFT JOIN user_post_tags AS upt"
            sql += " ON upt.id = ptu.tag_id"
            sql += " WHERE ptu.tag_id='" + id +"'"
            sql += " AND upt.tag<>''"
            // conn.query(sql, function (err, result) {
            //     if (err) reject(err);

            //     resolve(result)
            // });

            return await defaultModel.getMysql(conn.getDbMySqlProduction(),sql)
        // });
    },

    getUserGroups : async function(id){
        // return new Promise(function(resolve, reject) {
            var sql = `SELECT 
                        g.group_name as groupName, 
                        g.group_desc as groupDesc, 
                        g.group_type as groupType, 
                        g.group_icon as groupIcon, 
                        g.group_creator as groupCreator, 
                        g.group_announce as groupAnnounce, 
                        g.is_private as isPrivate, 
                        g.created_at as createdAt, 
                        g.updated_at as updatedAt, 
                        g.created_by as createdBy, 
                        g.post_count as postCount, 
                        g.unread_count as unreadCount, 
                        g.user_count as userCount, 
                        g.grouptype_id as grouptypeId, 
                        g.level, 
                        g.lang, 
                        g.is_deleted as isDeleted, 
                        g.usertype, 
                        g.is_active as isActive, 
                        g.max_number as maxNumber, 
                        g.start_date as startDate, 
                        g.end_date as endDate, 
                        g.class_time as classTime, 
                        g.group_city as groupCity, 
                        g.group_province as groupProvince, 
                        g.group_country as groupCountry, 
                        g.founder, 
                        g.update_by as updateBy, 
                        g.group_slug as groupSlug, 
                        g.school_id as schoolId
                        FROM groups as g
                        LEFT JOIN user_groups AS ug
                        ON ug.group_id = g.group_id
                        WHERE ug.user_id=${id}`
            // conn.query(sql, function (err, result) {
            //     if (err) reject(err);

            //     resolve(result)
            // });

            return await defaultModel.getMysql(conn.getDbMySqlProduction(),sql)
        // });
    },

    getUserNotes : async function(id){
        // return new Promise(function(resolve, reject) {
            var sql = "SELECT note, created_at as createdAt, created_by as createdBy, updated_at as updatedAt FROM user_notes"
            sql += " WHERE user_id='" + id +"'"
            // conn.query(sql, function (err, result) {
            //     if (err) reject(err);

            //     resolve(result)
            // });

            return await defaultModel.getMysql(conn.getDbMySqlProduction(),sql)
        // });
    },

    getUserFeeds : async function(id){
        // return new Promise(function(resolve, reject) {
            var sql = "SELECT * FROM user_feeds"
            sql += " WHERE user_id='" + id +"'"
            // conn.query(sql, function (err, result) {
            //     if (err) reject(err);

            //     resolve(result)
            // });
            return await defaultModel.getMysql(conn.getDbMySqlProduction(),sql)
        // });
    },

    getUserEmailLogs : async function(id){
        // return new Promise(function(resolve, reject) {
            var sql = `SELECT 
                        email_id as emailId,  
                        email_send_id as emailSendId,  
                        opens,  
                        clicks,  
                        createdAt  
                        FROM email_logs
                        WHERE user_id='${id}'
                        ORDER BY createdAt DESC
                        LIMIT 10`
            // conCpodLogging.query(sql, function (err, result) {
            //     if (err) reject(err);

            //     resolve(result)
            // });

            return await defaultModel.getMysql(conn.getDbMySqlLogging(),sql)
        // });
    },

    getUserEmailLogsTotal : async function(){
        // return new Promise(function(resolve, reject) {
            var sql = `SELECT 
                        COUNT(*) as total
                        FROM email_logs`
            // conCpodLogging.query(sql, function (err, result) {
            //     if (err) reject(err);

            //     resolve(result)

            // });
            return await defaultModel.getMysql(conn.getDbMySqlLogging(),sql)
        // });
    },

    getEmailLogs : async function(offset){
        // return new Promise(function(resolve, reject) {
            var sql = `SELECT
                        user_id
                        FROM email_logs 
                        LIMIT 100 
                        OFFSET ${offset}`
            // conCpodLogging.query(sql, function (err, result) {
            //     if (err) reject(err);

            //     resolve(result)
            // });
            return await defaultModel.getMysql(conn.getDbMySqlLogging(),sql)
        // });
    },


    getUserLessonTracks : async function(id){
        // return new Promise(function(resolve, reject) {
            var sql = `SELECT 
                        v3_id as v3Id,  
                        track_type as trackType,  
                        progress,  
                        source,  
                        timestamp as createdAt,  
                        updated_at as updateddAt  
                        FROM lesson_tracks
                        WHERE user_id='${id}'
                        ORDER BY updated_at DESC`
            // conCpodLogging.query(sql, function (err, result) {
            //     if (err) reject(err);

            //     resolve(result)
            // });

            return await defaultModel.getMysql(conn.getDbMySqlLogging(),sql)
        // });
    },
    
    getUserDailyStats : async function(id){
        // return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            lessons_studied as lessonStudied,
                            tests_taken as testTaken,
                            average_score as averageScore,
                            average_last_score as averageLastScore,
                            time_spent as timeSpent,
                            date as date,
                            createdAt as createdAt
                        FROM user_daily_stats
                        WHERE user_id='${id}'
                        
                        ORDER BY createdAt DESC
                        LIMIT 10`;
            // conn.query(sql, function (err, result) {
            //     if (err) reject(err);

            //     resolve(result)
            // });
            return await defaultModel.getMysql(conn.getDbMySqlProduction(),sql)
        // });
    },

    userLastVisit : async function(id){
        // return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            url,
                            time
                        FROM user_log
                        WHERE user_id='${id}'
                        ORDER BY time DESC
                        LIMIT 10`;
            // conn.query(sql, function (err, result) {
            //     if (err) reject(err);

            //     resolve(result)
            // });
            return await defaultModel.getMysql(conn.getDbMySqlProduction(),sql)
        // });
    },

    // getUsersList : async function(limit,offset){
    //     // return new Promise(function(resolve, reject) {
    //         var sql =   `SELECT
    //                         id
    //                     FROM ${tableName}
    //                     LIMIT ${limit}
    //                     OFFSET ${offset}`;
    //     //     conn.query(sql, function (err, result) {
    //     //         if (err) reject(err);

    //     //         resolve(result)
    //     //     });
    //         return await defaultModel.getMysql(conn.getDbMySqlProduction(),sql)
    //     // });
    // },

    getUsersDictionaries : async function(id){
        // return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            DISTINCT(word),
                            ip,
                            search_time as searchTime
                        FROM dictionary_search
                        WHERE user_id='${id}'
                        ORDER BY search_time DESC`;
            // conn.query(sql, function (err, result) {
            //     if (err) reject(err);

            //     resolve(result)
            // });
            return await defaultModel.getMysql(conn.getDbMySqlProduction(),sql)
        // });
    },
    
    getUserRole : async function(roleId){
        // return new Promise(function(resolve, reject) {
            var sql =   `SELECT
                            *
                        FROM roles
                        WHERE id='${roleId}'`;
            // conn.query(sql, function (err, result) {
            //     if (err) reject(err);

            //     resolve(result)
            // });
            return await defaultModel.getMysql(conn.getDbMySqlProduction(),sql)
        // });
    },

    // getUserSchool : async function(schoolId){
    //     return new Promise(function(resolve, reject) {
    //         var sql =   `SELECT
    //                         *
    //                     FROM school
    //                     WHERE school_id='${schoolId}'`;
    //         conn.query(sql, function (err, result) {
    //             if (err) reject(err);

    //             resolve(result)
    //         });
    //     });
    // },

    // getUserAge : async function(ageId){
    //     return new Promise(function(resolve, reject) {
    //         var sql =   `SELECT
    //                         *
    //                     FROM ages
    //                     WHERE id='${ageId}'`;
    //         conn.query(sql, function (err, result) {
    //             if (err) reject(err);

    //             resolve(result)
    //         });
    //     });
    // },

    // getUserActions : async function(id){
    //     return new Promise(function(resolve, reject) {
    //         var sql =   `SELECT
    //                         ua.display_status as displayStatus,
    //                         ua.action_display as actionDisplay,
    //                         uat.id as actionTypeId,
    //                         uat.parent_id as actionTypeParentId,
    //                         uat.type_name as actionTypeName,
    //                         uat.type_image as actionTypeImage,
    //                         uat.type_format_description as actiondescription,
    //                         ua.action_time as actionTime
    //                     FROM user_action ua
    //                     LEFT JOIN user_action_type uat
    //                     ON ua.action_type_id=uat.id
    //                     WHERE ua.user_id='${id}'`;
    //         conn.query(sql, function (err, result) {
    //             if (err) reject(err);

    //             resolve(result)
    //         });
    //     });
    // },

    // getUserCampaign : async function(id){
    //     return new Promise(function(resolve, reject) {
    //         var sql =   `SELECT
    //                         code,
    //                         campaign_params as params,
    //                         created
    //                     FROM user_campaigns
    //                     WHERE user_id='${id}'`;
    //         conn.query(sql, function (err, result) {
    //             if (err) reject(err);

    //             resolve(result)
    //         });
    //     });
    // },

    // getUserOrder : async function(id){
    //     return new Promise(function(resolve, reject) {
    //         var sql =   `SELECT
    //                         o.product_id as productId,
    //                         o.product_type as productType,
    //                         o.promo_code as promoCode,
    //                         o.payment,
    //                         o.billed_amount as billedAmount,
    //                         o.pay_status as payStatus,
    //                         o.pay_method as payMethod,
    //                         o.action_type as actionType,
    //                         o.finished,
    //                         o.start_date as startDate,
    //                         o.end_date as endDate,
    //                         o.created_at as createdAt,
    //                         o.updated_at as updatedAt,
    //                         o.notes,
    //                         ot.order_type as orderType,
    //                         p.name as promoName,
    //                         p.code as promoCode
    //                     FROM orders o
    //                     LEFT JOIN order_type ot
    //                     ON ot.order_id=o.id
    //                     LEFT JOIN orders_to_promotions otp
    //                     ON otp.order_id=o.id
    //                     LEFT JOIN promotions p
    //                     ON p.id=otp.promotion_id
    //                     WHERE o.user_id='${id}'`;
    //         conn.query(sql, function (err, result) {
    //             if (err) reject(err);

    //             resolve(result)
    //         });
    //     });
    // },

}