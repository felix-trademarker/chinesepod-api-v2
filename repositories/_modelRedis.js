class Model{
    constructor(table){
        this.db = require('../config/DbConnect');
        this.table = table
    }

    get(key) {
        var this_ = this
        return new Promise(async function(resolve, reject) {
            // set and get function TODO:
            // console.log(this_.db.getRedisConn());
            let client = await this_.db.getRedisConn();
            let value = await client.get(this_.table+":"+key)
            await client.disconnect();
            resolve(JSON.parse(value));

        });
    }

    set(key, value) {
        var this_ = this
        return new Promise(async function(resolve, reject) {

            let client = await this_.db.getRedisConn();
            let val = await client.set(this_.table+":"+key, value)
            await client.disconnect();
            resolve(val);

        });
    }

}

module.exports = Model;