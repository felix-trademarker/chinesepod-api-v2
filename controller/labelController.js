let giftPackages = require('../repositories/giftPackages')

let _ = require('lodash')
const sanitizeHtml = require('sanitize-html')
const geoip = require('geoip-country')


const { asyncForEach } = require('../frequent')


exports.giftPackages = async function(req, res, next) {

  const startDate = '2019-11-04 00:00:00'
  // console.log(req.query)
  let inputs = req.query
  // let sentPackages = (await GiftTracking.find().select(['id'])).map(
  //   (item) => {
  //     return item.id
  //   }
  // )

  let sqlQuery = "SELECT user_id as id FROM gift_tracking";
  let sentPackages = (await giftPackages.getMysqlProduction(sqlQuery)).map(
    (item) => {
      return item.id
    }
  )
  

  // fetch from mongo 
  
  // console.log(sentPackages.concat(oldTransactions));
  // console.log(sentPackages);

  // return {}

  let oldTransactions = require('../lib/oldTransactions.json')

  // FETCH MONGO RECORDS 
  let sentFromWebApp = (await giftPackages.get()).map(
    (item) => {
      return item.id
    }
  )
  // console.log(sentFromWebApp);
  // console.log('this',sentPackages.length);
  // sentPackages = sentPackages.concat(sentFromWebApp)

    console.log('then',sentPackages.length);
  // console.log(sentPackages.concat(oldTransactions));
  sqlQuery = "SELECT * FROM transactions WHERE pay_status=2 AND is_recurring_payment=0 AND date_created >= '"+startDate+"' AND user_id NOT IN ("+sentPackages.concat(oldTransactions).join(",")+")";
  let relevantTransactions = await giftPackages.getMysqlProduction(sqlQuery)
  // let relevantTransactions = await Transactions.find({
  //   where: {
  //     user_id: {
  //       nin: sentPackages.concat(oldTransactions),
  //     },
  //     pay_status: 2,
  //     is_recurring_payment: 0,
  //     createdAt: {
  //       '>=': startDate,
  //     },
  //   },
  // })

  console.log('plain',relevantTransactions.length);

  // res.json(relevantTransactions)

  // return;
 
  // relevantTransactions = _.uniq(relevantTransactions, function (item) {
  //   return item.user_id
  // })

  relevantTransactions = relevantTransactions.filter((value, index, self) => 
    self.findIndex(v => v.user_id === value.user_id) === index
  );

  console.log('uniq',relevantTransactions.length);

  relevantTransactions = relevantTransactions.map((transaction) => {
    return transaction.id
  })
  console.log('map',relevantTransactions.length);


  
  // res.json(relevantTransactions)

  // return;
  // let addresses = await TransactionAddresses.find({
  //   where: {
  //     country: inputs.country,
  //     updatedAt: {
  //       '>=': startDate,
  //     },
  //     transaction_id: {
  //       in: relevantTransactions,
  //     },
  //   },
  //   select: [
  //     'transaction_id',
  //     'country',
  //     'state',
  //     'city',
  //     'zip_code',
  //     'full_name',
  //     'address1',
  //     'address2',
  //   ],
  //   sort: 'updatedAt DESC',
  // })

  sqlQuery = "SELECT id,transaction_id, country, state, city, zip_code, full_name, address1, address2 "+
              "FROM transaction_addresses "+
              "WHERE country='"+inputs.country+"' AND last_update >= '"+startDate+"' AND transaction_id IN ("+relevantTransactions.join(",")+") AND id NOT IN ("+sentFromWebApp.join(",")+")" +
              "ORDER BY last_update DESC"
  let addresses = await giftPackages.getMysqlProduction(sqlQuery)
  // res.json(addresses);
  console.log("addresses", addresses.length);
  // return;

  // sails.log.info(addresses)

  const europeanAddresses = [
    'AT',
    'BE',
    'CH',
    'DE',
    'DK',
    'FR',
    'FI',
    'NL',
    'PT',
    'RU',
    'SE',
    'NO',
    'UA',
    'UK',
  ]

  const asiaAddresses = ['HK', 'CN', 'TW']

  addresses.forEach((address) => {
    let ship_from = `ChinesePod LLC  |  246 West Broadway  |  New York NY 10013`
    if (europeanAddresses.includes(address.country.toUpperCase())) {
      ship_from = `ChinesePod LLC  |  P.O. Box 9026  |  NL-6070 AA Swalmen`
    } else if (asiaAddresses.includes(address.country.toUpperCase())) {
      ship_from = `ChinesePod Limited  |  General Post Office Box 7347  |  Hong Kong S.A.R.`
    } else if ('PH' === address.country.toUpperCase()) {
      ship_from = `Lapu-Lapu City Post Office Box 16  |  6015 Lapu-Lapu City  |  Philippines`
    }

    // add new ship from address from selected country
    switch (address.country.toUpperCase()) {
      case 'BE': 
        ship_from = `ChinesePod Limited  |  Leeuwenstraat 4  |  2000 Antwerpen  | Belgium`; break;
      case 'DE': 
        ship_from = `ChinesePod Limited  |  Königsallee 27  |  40212 Dusseldorf  |  Germany`; break;

      case 'HK': 
        ship_from = `ChinesePod Limited  |  General Post Office Box 7347  |  Hong Kong S.A.R`; break;

      case 'NL': 
        ship_from = `ChinesePod Limited  |  Markt 19  |  6071 JD Swalmen  |  The Netherlands`; break;

      case 'TW': 
        ship_from = `ChinesePod Limited  |  2F No. 219, No. 1 Section 5 | Zhongxiao East Road | Xinyi District | Taipei City 11071 | Taiwan (R.O.C.)`; break;

      case 'US': 
        ship_from = `ChinesePod Limited  |  4 Taylor Street  |  Millburn NY 07041`; break;

    }

    address.ship_from = ship_from
    address.ship_to = `${
      address.address1.length > 0 ? address.address1 + '\n' : ''
    }${address.address2.length > 0 ? address.address2 + '\n' : ''}${
      address.city ? address.city : ''
    } ${address.state ? address.state : ''} ${
      address.zip_code ? address.zip_code : ''
    }`
  })

  let retData = {
    total: addresses.length,
    country: inputs.country,
    addresses: addresses.slice(0, inputs.size ? inputs.size : 5),
  }

  res.json(retData)

  
}





