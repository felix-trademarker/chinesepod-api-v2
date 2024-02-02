## ChinesePod Affiliate Process
- Users can register their account as affiliates and send referral url. 

### Step 1: https://www.chinesepod.com/affiliates/register
- This page allows the user to register their account as affiliates. An email will be sent to user after registration for approval, emails will be sent to ugis@chinesepod.com and harvey@chinesepod.com for approval. 

### Step 2: https://www.chinesepod.com/affiliates/confirm?code=<affiliateId>
- This allows admin to approve users application. affiliateId can be found in **affiliate_details** in mysql database. after confirming the application, an email notification will be sent to the user regarding the affiliate application with a button to affiliate dashboard.
> UPDATE status 1(approved) | 0(default or pending)

### Step 3: https://www.chinesepod.com/affiliates/home
- This page is for the new approved affiliate, this page will list all referrals with sample links with a tag as a parameter. **tag** can be found in **affiliate_details** table.

**Example links:**
- https://www.chinesepod.com/?tag=6353UFFH
- https://www.chinesepod.com/lesson/88-characters-with-carly-part-1?tag=6353UFFH
- https://www.chinesepod.com/start-learning-chinese?tag=6353UFFH
- https://www.chinesepod.com/dictionary/学习?tag=6353UFFH

### Step 4: 
- Using referral link register/signup account in chinesepod with tag, this will add a record in affiliate_events table, this will serve as referral to affiliates. 
> FEE: signup(0.5) and upgrade(10)

<hr>

## Mysql Database
**Database:** chinesepod_production

**Tables:** 
- affiliate_details, This stores all affiliated users
- affiliate_events, This records all users events and links to users and affiliated users