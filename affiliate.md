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

## ChinesePod Affiliate Payment Process
- Chinesepod admin will generate invoice document and send payment to customer. update system records according to paid invoice.

### Step 1: 
- From affiliates list, click on which affiliates to generate invoice. After selecting an affiliate it should show the affiliates details and in the date range select date from and to. Tick checkbox which outstanding referrals to generate invoice.
- After selecting outstanding referrals at the upper right from the table a button to generate invoice should show and after clicking that button, this will geenrate invoice document and download directly to your computer.

### Step 2: 
- From affiliates admin dashboard, at the right side bar, click on credit notes.
- After clicking on credit notes, the new generated invoice should show in the list of invoice with status "outstanding"
- When payment is made, admin can update the invoice as paid. button is at the last column of each row.

## Mysql Database
**Database:** chinesepod_production

**Tables:** 
- affiliate_details, This stores all affiliated users
- affiliate_events, This records all users events and links to users and affiliated users

**Source Code**
- github CPOD-Affiliates