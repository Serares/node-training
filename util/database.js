const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const pass = require('../config/db_pass').mongoPass;
let _db;

const mongoConnect = (callback) => {

    MongoClient.connect(`mongodb+srv://rares:${pass()}@cluster0-xyshh.mongodb.net/shop?retryWrites=true&w=majority`, {useUnifiedTopology: true})
        .then(client => {
            console.log("Connected");
            _db = client.db();
            callback();
        })
        .catch(err => {
            console.log(err);
            throw err;
        });

}

const getDb = () =>{
    if(_db){
        return _db;
    }

    throw new Error('no db found');
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;