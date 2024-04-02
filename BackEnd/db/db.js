const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "DB",
});

db.connect((err) => {
  if (err) throw err;
  console.log("数据库已连接");
});

module.exports = db;
