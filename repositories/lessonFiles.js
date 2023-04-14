const AWS = require('aws-sdk');

let config = {
    accessKeyId: process.env.awsKey,
    secretAccessKey: process.env.awsSecret,
    region: 'us-east-1',
}

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

module.exports = {

	find : async function(field,value,limit=1){

        const params = {
            TableName: 'chinesepod-video-streaming',
            FilterExpression: field+' = :video',
            ExpressionAttributeValues: {
                ':video': value
            },
            Limit: limit
        };
        return new Promise(function(resolve, reject) {

            docClient.scan(params, function (err, data) {

                if (err) {
                    reject(err);

                } else {
                    const { Items } = data;
                    resolve(Items)
                }
            });
        })

    },
    




}