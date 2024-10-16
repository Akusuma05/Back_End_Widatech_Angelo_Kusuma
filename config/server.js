var mysql = require('mysql');

//Initialize connection to MySQL Database
var con = mysql.createConnection({
  host: "127.0.0.1",
  port: "8889",
  user: "root",
  password: "root",
  database: 'widatech',
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

module.exports = con;