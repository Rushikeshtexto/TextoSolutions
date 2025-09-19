import mysql from "mysql2";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "@Rushi1234",
  database: "texto",
  port:3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
  } else {
    console.log("✅ MySQL Pool Connected");
    connection.release(); // release back to pool
  }
});

export default db;
