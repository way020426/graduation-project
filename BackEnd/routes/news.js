const express = require("express");
const router = express.Router();
const db = require("../db/db");

// 获取资讯分类列表
router.get("/categories", (req, res) => {
  db.query("SELECT DISTINCT Category FROM news", (err, results) => {
    if (err) {
      return res.status(500).send("查询分类失败");
    }
    // 提取所有分类
    const categories = results.map((item) => item.Category);
    res.json(categories);
  });
});

// 获取特定分类的资讯列表
router.get("/get", (req, res) => {
  const { category } = req.query;
  let sql =
    category && category !== "所有"
      ? "SELECT * FROM news WHERE Category = ?"
      : "SELECT * FROM news";

  db.query(
    sql,
    category && category !== "所有" ? [category] : [],
    (err, results) => {
      if (err) {
        return res.status(500).send("查询资讯失败");
      }
      res.json(results);
    }
  );
});

// 添加资讯
router.post("/add", (req, res) => {
  const { Title, Content, Category, Url } = req.body;
  const sql =
    "INSERT INTO news (Title, Content, Category, Url) VALUES (?, ?, ?, ?)";
  db.query(sql, [Title, Content, Category, Url], (err, result) => {
    if (err) {
      return res.status(500).send("添加资讯失败");
    }
    res.json({ message: "资讯添加成功" });
  });
});

// 修改资讯
router.put("/update/:id", (req, res) => {
  const { id } = req.params;
  const { Title, Content, Category, Url } = req.body;
  const sql =
    "UPDATE news SET Title = ?, Content = ?, Category = ?, Url = ? WHERE NewsId = ?";
  db.query(sql, [Title, Content, Category, Url, id], (err, result) => {
    if (err) {
      return res.status(500).send("修改资讯失败");
    }
    res.json({ message: "资讯修改成功" });
  });
});

// 删除资讯
router.delete("/del/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM news WHERE NewsId = ?", [id], (err, result) => {
    if (err) {
      return res.status(500).send("删除资讯失败");
    }
    res.json({ message: "资讯删除成功" });
  });
});

module.exports = router;
