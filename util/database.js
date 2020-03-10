const mysql = require('mysql2');


const pool = mysql.createPool({
    host:'localhost',
    user:"root",
    database:"node_training",
    password:"parola"
});


module.exports = pool.promise();
