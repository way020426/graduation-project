const express = require("express");
const router = express.Router();
const db = require("../db/db");

// 获取学习计划
router.get("/get", (req, res) => {
  const userId = req.headers["user-id"];
  // 查询未完成的计划，按照开始日期升序排序，完成的计划排在最后
  db.query(
    "SELECT * FROM study_plans WHERE UserId = ? ORDER BY CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END, StartDate ASC",
    [userId],
    (err, results) => {
      if (err) {
        return res.status(500).send("获取计划列表失败");
      }
      res.json(results);
    }
  );
});

// 添加学习计划
router.post("/add", (req, res) => {
  const userId = req.headers["user-id"];
  const {
    PlanDescription,
    StartDate,
    EndDate,
    Status,
    DailyStudyTime,
    PlanType,
  } = req.body;
  db.query(
    "INSERT INTO study_plans (UserId, PlanDescription, StartDate, EndDate, Status, DailyStudyTime, PlanType) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      userId,
      PlanDescription,
      StartDate,
      EndDate,
      Status,
      DailyStudyTime,
      PlanType,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send("添加计划失败");
      }
      res.json({ message: "计划添加成功", planId: result.insertId });
    }
  );
});

// 更新学习计划
router.put("/update/:id", (req, res) => {
  const userId = req.headers["user-id"];
  const { id } = req.params;
  const {
    PlanDescription,
    StartDate,
    EndDate,
    Status,
    DailyStudyTime,
    PlanType,
  } = req.body;
  // console.log(req.body);

  // 更新学习计划
  const updateSql =
    "UPDATE study_plans SET PlanDescription = ?, StartDate = ?, EndDate = ?, Status = ?, DailyStudyTime = ?, PlanType = ? WHERE PlanId = ? AND UserId = ?";
  db.query(
    updateSql,
    [
      PlanDescription,
      StartDate,
      EndDate,
      Status,
      DailyStudyTime,
      PlanType,
      id,
      userId,
    ],
    (updateErr, updateResult) => {
      if (updateErr) {
        console.error(updateErr);
        return res.status(500).send("计划更新失败");
      }

      // 如果状态更新为完成，则添加到学习进度
      if (Status === "Completed") {
        const insertProgressSql =
          "INSERT INTO learning_progress (UserId, PlanType, StudyTime) VALUES (?, ?, ?)";
        db.query(
          insertProgressSql,
          [userId, PlanType, DailyStudyTime],
          (insertErr, insertResult) => {
            if (insertErr) {
              console.error(insertErr);
              return res.status(500).send("添加到学习进度失败");
            }
            res.json({ message: "计划更新成功" });
          }
        );
      } else {
        res.json({ message: "计划更新成功" });
      }
    }
  );
});

// 删除学习计划
router.delete("/del/:id", (req, res) => {
  const userId = req.headers["user-id"];
  const { id } = req.params;
  db.query(
    "DELETE FROM study_plans WHERE PlanId = ? AND UserId = ?",
    [id, userId],
    (err, result) => {
      if (err) {
        return res.status(500).send("计划删除失败");
      }
      res.json({ message: "计划删除成功" });
    }
  );
});

module.exports = router;
