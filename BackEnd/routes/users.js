const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// 导入数据库连接
const db = require("../db/db");
const router = express.Router();

// 用户注册
router.post("/register", async (req, res) => {
  try {
    const { username, password, phone } = req.body;

    // 首先检查用户名是否已存在
    const checkUsernameSql = "SELECT * FROM users WHERE username = ?";
    db.query(checkUsernameSql, [username], async (err, usernameResults) => {
      if (err) {
        console.error("查询用户名时出现错误:", err);
        return res.status(500).send("查询用户名时出现数据库错误");
      }

      if (usernameResults.length > 0) {
        return res.status(409).send("用户名已被注册");
      }

      // 接着检查手机号是否已存在
      const checkPhoneSql = "SELECT * FROM users WHERE phone = ?";
      db.query(checkPhoneSql, [phone], async (phoneErr, phoneResults) => {
        if (phoneErr) {
          console.error("查询手机号时出现错误:", phoneErr);
          return res.status(500).send("查询手机号时出现数据库错误");
        }

        if (phoneResults.length > 0) {
          return res.status(409).send("手机号已被注册");
        }

        // 用户名和手机号均未被使用，可以进行注册
        const hashedPassword = await bcrypt.hash(password, 10);
        const registerTime = new Date()
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");

        // 插入数据库代码
        const sql =
          "INSERT INTO users (username, password, phone, registerTime) VALUES (?, ?, ?, ?)";
        db.query(
          sql,
          [username, hashedPassword, phone, registerTime],
          (insertErr, result) => {
            if (insertErr) {
              console.error("注册过程中出现错误:", insertErr);
              return res.status(500).send("注册用户时出现数据库错误");
            }
            res.json({ message: "用户注册成功" });
          }
        );
      });
    });
  } catch (err) {
    console.error("服务器错误:", err);
    res.status(500).send("服务器错误");
  }
});

// 用户登录
router.post("/login", async (req, res) => {
  const { username, password, type } = req.body;
  // 根据类型选择查询的表
  const table = type === "admin" ? "admin" : "users";

  // 从数据库获取用户信息
  const sql = `SELECT * FROM ${table} WHERE username = ?`;
  db.query(sql, [username], async (err, results) => {
    // 查询错误
    if (err) {
      console.error("数据库查询错误:", err);
      return res.status(500).send("登录过程中出现数据库错误");
    }

    if (results.length === 0) {
      return res.status(404).send("用户不存在");
    }

    // 验证密码
    try {
      const user = results[0];
      // console.log("数据库返回的用户信息:", results[0]);
      const isValidPassword = await bcrypt.compare(
        password,
        results[0].Password
      );
      if (!isValidPassword) {
        return res.status(401).send("密码错误");
      }

      // 创建JWT令牌
      const token = jwt.sign({ username: username }, "YOUR_SECRET_KEY", {
        expiresIn: "1h",
      });
      res.json({
        message: "登录成功",
        token: token,
        stateLogin: true,
        userId: user.UserId,
      });
    } catch (error) {
      console.error("密码验证错误:", error);
      res.status(500).send("密码验证过程中出现错误");
    }
  });
});

// 获取所有用户
router.get("/getusers", async (req, res) => {
  const sql = "SELECT Userid, Username, Phone, RegisterTime FROM users";
  db.query(sql, (err, results) => {
    if (err) {
      // console.error(err);
      return res.status(500).send("无法获取用户列表");
    }
    res.json(results);
  });
});

// 删除用户
router.delete("/deluser/:id", async (req, res) => {
  const { id } = req.params;
  console.log("删除用户的ID:", id, req.params);
  const sql = "DELETE FROM users WHERE Userid = ?";
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("删除用户失败");
    }
    res.json({ message: "用户删除成功" });
  });
});

// 获取特定用户的信息
router.get("/userinfo/:id", async (req, res) => {
  const { id } = req.params;

  const sql =
    "SELECT UserId, Username, Phone, RegisterTime FROM users WHERE UserId = ?";
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("获取用户信息失败");
    }

    if (results.length === 0) {
      return res.status(404).send("用户不存在");
    }

    res.json(results[0]);
  });
});

// 修改密码
router.post("/changepassword", async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  // 获取用户当前的密码
  const userSql = "SELECT Password FROM users WHERE UserId = ?";
  db.query(userSql, [userId], async (userErr, userResults) => {
    if (userErr) {
      console.error("查询用户密码时出现错误:", userErr);
      return res.status(500).send("查询用户密码时出现数据库错误");
    }

    // 检查旧密码是否正确
    const isMatch = await bcrypt.compare(oldPassword, userResults[0].Password);
    if (!isMatch) {
      return res.status(401).send("旧密码不正确");
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新数据库中的密码
    const updateSql = "UPDATE users SET Password = ? WHERE UserId = ?";
    db.query(
      updateSql,
      [hashedPassword, userId],
      (updateErr, updateResults) => {
        if (updateErr) {
          console.error("更新密码时出现错误:", updateErr);
          return res.status(500).send("更新密码时出现数据库错误");
        }
        res.json({ message: "密码更新成功" });
      }
    );
  });
});

module.exports = router;
