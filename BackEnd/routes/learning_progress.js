const express = require("express");
const router = express.Router();
const db = require("../db/db");

// 获取用户的学习进度
router.get("/get/:userId", (req, res) => {
  const userId = req.params.userId;
  db.query(
    "SELECT PlanType, SUM(StudyTime) AS TotalTime FROM learning_progress WHERE UserId = ? GROUP BY PlanType",
    [userId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send("获取学习进度失败");
      }
      //   console.log("学习进度:", results);
      res.json(results);
    }
  );
});

module.exports = router;
