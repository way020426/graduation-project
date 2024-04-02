const express = require("express");
const router = express.Router();
const db = require("../db/db");

// 获取所有反馈
router.get("/get", (req, res) => {
  const { type } = req.query;
  let sql = "SELECT * FROM feedback";
  if (type) {
    sql += ` WHERE Type = '${type}'`;
  }
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
});

// 提交反馈
router.post("/add", (req, res) => {
  const { username, type, content } = req.body;
  const sql = "INSERT INTO feedback (Username, Type, Content) VALUES (?, ?, ?)";

  db.query(sql, [username, type, content], (err, result) => {
    if (err) {
      console.error("提交反馈时发生错误:", err);
      return res.status(500).send("无法提交反馈");
    }
    res.json({ message: "反馈提交成功", feedbackId: result.insertId });
  });
});

module.exports = router;
