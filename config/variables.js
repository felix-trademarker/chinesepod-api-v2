
var ENV = process.env.ENVIRONMENT || 'prod';

module.exports = { 
    mongoURL        : process.env.MongoURILOCAL,
    mongoURLEU      : process.env.MongoURIEU,
    mongoURLAWS      : process.env.MongoURIAWS,
    mongoURL158      : process.env.MongoURI158,
    mongoOptions    : { 
                        useNewUrlParser: true, 
                        useUnifiedTopology: true 
                      },
    mongoDB         : 'bigfoot',
    filePathUpload  : (ENV === 'prod' ? process.env.uploadFilePath : process.env.uploadFilePathDev),

    domainTLD       : [{name: 'com'}],
    emailGen        : [{name: 'webmaster'}, {name: 'info'}, {name: 'legal'}, {name: 'contact'}],
    ipAddresses     : ['103.104.17','211.20.18','211.72.53','122.116.227','122.52.119','61.244.218','50.74.20','127.0.0','::1'],
    webAppURL       : 'https://play.google.com/apps/testing/com.chinesepod.express',
    mobileAppURL    : 'https://play.google.com/store/apps/details?id=com.chinesepod.express',
    coremarkets     : ['US', 'CA', 'UK', 'IE', 'PL'],
    coreFreeMonths  : [],
    nonCoreFreeMonths: [],
    prerollAdId: [
      '60qooe3gep',
      '2s3nnjmvz0',
      'brmum6248y',
      'mk2s8ktsnh',
      'yg33tm12mm',
      '61ti28a28x',
    ],
    prerollAds: [
      {
        title: 'Ads Like This',
        wistia: '60qooe3gep',
        vimeo: '409693870',
        length: 17,
      },
      {
        title: 'Attention Free Users',
        wistia: '2s3nnjmvz0',
        vimeo: '409693833',
        length: 15,
      },
      {
        title: 'Finally Get Rid of this...',
        wistia: 'brmum6248y',
        vimeo: '409693802',
        length: 14,
      },
      {
        title: 'Get Access to Everything',
        wistia: 'mk2s8ktsnh',
        vimeo: '409693770',
        length: 12,
      },
      {
        title: 'Good Advice For You',
        wistia: 'yg33tm12mm',
        vimeo: '409693731',
        length: 13,
      },
      {
        title: 'It would mean so much to me',
        wistia: '61ti28a28x',
        vimeo: '409693898',
        length: 17,
      },
    ],
  
    upgradeLink: '/upgrade',
};
