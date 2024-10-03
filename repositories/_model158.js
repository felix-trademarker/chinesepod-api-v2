class Model{
    constructor(table){
        this.db = require('../config/DbConnect');
        this.table = table
    }

    count() {
        var this_ = this
        return new Promise(function(resolve, reject) {
            
            this_.db.getDb158().collection(this_.table).find().count(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

        });
    }

    get() {
        var this_ = this
        return new Promise(function(resolve, reject) {
            
            this_.db.getDb158().collection(this_.table).find().toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

        });
    }

    find(id) {
        var this_ = this
        let ObjectID = require('mongodb').ObjectID;
        return new Promise(function(resolve, reject) {
            
            let query = { _id: ObjectID(id) };
			
			this_.db.getDb158().collection(this_.table).find(query).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

        });
    }

    findQuery(query) {
        var this_ = this
        let ObjectID = require('mongodb').ObjectID;
        return new Promise(function(resolve, reject) {
            
			
			this_.db.getDb158().collection(this_.table).find(query).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

        });
    }

    findQuerySelected(query, selectedFields = null ) {
        var this_ = this
        let ObjectID = require('mongodb').ObjectID;
        return new Promise(function(resolve, reject) {
            
			if (selectedFields) {
                this_.db.getDb158().collection(this_.table).find(query).project(selectedFields).toArray(function(err, result) {
					
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
    
                });
            } else {
                this_.db.getDb158().collection(this_.table).find(query).toArray(function(err, result) {
					
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
    
                });
            }
			

        });
    }

    paginate(skip,limit) {
        var this_ = this
        let ObjectID = require('mongodb').ObjectID;
        return new Promise(function(resolve, reject) {
            
			
			this_.db.getDb158().collection(this_.table).find().skip(skip).limit(limit).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

        });
    }

    update(id, data) {
        var this_ = this
        let ObjectID = require('mongodb').ObjectID;
        return new Promise(function(resolve, reject) { 

            let query = { _id: ObjectID(id) };

            this_.db.getDb158().collection(this_.table).updateOne(query,{$set: data }, 
                function(err, result) {
                
                if (err) reject(err);
					
                resolve(result);
                
			});

		});
    }

    put(data) {
        var this_ = this
        return new Promise(function(resolve, reject) {

			this_.db.getDb158().collection(this_.table).insertOne(data, 
				function(err, result) {
					if (err) reject(err);
                    
					resolve(result);
				}
			);

        });
    }

    upsert(query, data) {
        var this_ = this

        return new Promise(function(resolve, reject) { 

            this_.db.getDb158().collection(this_.table).updateOne(query,{$set: data },{upsert:true}, 
                function(err, result) {
                
                if (err) reject(err);
					
                resolve(result);
                
			});

		});
    }

    remove(id) {

        var this_ = this

		return new Promise(function(resolve, reject) {
            let ObjectID = require('mongodb').ObjectID;
			let query = { _id: ObjectID(id) };
            

			this_.db.getDb158().collection(this_.table).deleteOne(query, function(err, result) {
				if (result) {
		
					resolve(result)
				} else {
			
					reject(err);
				}
			});
		});

    }

    removeFields(id, query) {

        var this_ = this

		return new Promise(function(resolve, reject) { 

         

            this_.db.getDb158().collection(this_.table).updateMany({id:id},{$unset: query}, 
                function(err, result) {
                
                if (err) reject(err);
					
                resolve(result);
                
			});

		});

    }

    // external DB MYSQL
    getMysql(con,query) {

		return new Promise(function(resolve, reject) {
            con.query(query, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
		});

    }

    insertMysql(con,query, data) {

		return new Promise(function(resolve, reject) {
            con.query(query, data, function (err, result) {
                if (err) reject(err);

                resolve(result)
            });
		});

    }
}

module.exports = Model;