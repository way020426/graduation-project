const express = require("express");
const fs = require("fs");
const router = express.Router();
const db = require("../db/db");
const qiniuUtils = require("../utils/qiniu");
const multer = require("multer");
const { log } = require("console");
const upload = multer({ dest: "uploads/" }); // 设置上传文件的临时目录

// 获取学习资料列表
router.get("/get", (req, res) => {
  const { type } = req.query;
  let sql = "SELECT * FROM study_materials";
  if (type) {
    sql += ` WHERE MaterialType = '${type}'`;
  }
  db.query(sql, (err, results) => {
    if (err) {
      //   console.log(err);
      return res.status(500).send("查询学习资料失败");
    }
    res.json(results);
  });
});

// 添加学习资料
router.post("/add", upload.single("file"), async (req, res) => {
  const { FileName, MaterialType, Category } = req.body;
  const localFile = req.file.path;

  if (!FileName) {
    console.log(FileName);
    return res.status(400).send("资料标题不能为空");
  }

  try {
    // 上传文件到七牛云
    const folderPath = `materials/${encodeURIComponent(
      Category
    )}/${encodeURIComponent(MaterialType)}/`;
    const key = `${folderPath}${Date.now()}-${encodeURIComponent(
      req.file.originalname
    )}`;
    await qiniuUtils.uploadFile(key, localFile);

    const FileUrl = `http://saw8e2h5g.hb-bkt.clouddn.com/${key}`;

    // 将文件信息保存到数据库
    const sql =
      "INSERT INTO study_materials (FileName, MaterialType, Category, FileUrl) VALUES (?, ?, ?, ?)";
    db.query(
      sql,
      [FileName, MaterialType, Category, FileUrl],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).send("添加学习资料失败");
        }
        res.json({ message: "学习资料添加成功", FileUrl });
        fs.unlink(localFile, (err) => {
          if (err) console.error("Error deleting temp file:", err);
        });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).send("上传文件到七牛云失败");
  }
});

// 删除学习资料
router.delete("/del/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT FileUrl FROM study_materials WHERE MaterialId = ?",
    [id],
    async (err, results) => {
      if (err || results.length === 0) {
        return res.status(500).send("找不到要删除的文件");
      }

      try {
        // 先从七牛云删除文件
        const fileUrl = results[0].FileUrl;
        await qiniuUtils.deleteFile(
          results[0].FileUrl.replace("http://saw8e2h5g.hb-bkt.clouddn.com/", "")
        );

        // 然后从数据库删除记录
        db.query(
          "DELETE FROM study_materials WHERE MaterialId = ?",
          [id],
          (err) => {
            if (err) {
              return res.status(500).send("删除数据库记录失败");
            }
            res.json({ message: "学习资料删除成功" });
          }
        );
      } catch (error) {
        console.log("删除七牛云文件失败:", error);
        res.status(500).send("删除七牛云文件失败");
      }
    }
  );
});

// 修改学习资料
router.put("/update/:id", upload.single("file"), async (req, res) => {
  const { id } = req.params;
  const { FileName, MaterialType, Category, hasFile } = req.body;
  let FileUrl = req.body.FileUrl;

  try {
    if (hasFile === "true") {
      const localFile = req.file.path;
      const key = `materials/${Category}/${MaterialType}/${Date.now()}-${encodeURIComponent(
        req.file.originalname
      )}`;
      await qiniuUtils.uploadFile(key, localFile);
      FileUrl = `http://saw8e2h5g.hb-bkt.clouddn.com/${key}`;

      // 如果有旧文件，则从七牛云删除
      if (req.body.FileUrl) {
        const oldKey = req.body.FileUrl.split("/").pop();
        await qiniuUtils.deleteFile(oldKey);
      }

      // 删除本地临时文件
      fs.unlink(localFile, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });
    }

    const sql =
      "UPDATE study_materials SET FileName = ?, MaterialType = ?, Category = ?, FileUrl = ? WHERE MaterialId = ?";
    db.query(
      sql,
      [FileName, MaterialType, Category, FileUrl, id],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).send("修改学习资料失败");
        }
        res.json({ message: "学习资料修改成功" });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).send("上传文件到七牛云失败或其他错误");
  }
});

module.exports = router;
