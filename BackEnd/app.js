const express = require("express");
const usersRouter = require("./routes/users");
const newsRouter = require("./routes/news");
const feedBackRouter = require("./routes/feedBack");
const materialsRouter = require("./routes/materials");
const examRouter = require("./routes/exam");
const plansRouter = require("./routes/plans");
const learning_progressRouter = require("./routes/learning_progress");
const app = express();
const passport = require("passport");
require("dotenv").config();

// 解决跨域问题
const cors = require("cors");
app.use(cors());

// 初始化passport和会话管理
app.use(
  require("express-session")({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// 设置passport的序列化和反序列化
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  // 这里应从你的数据库中查找用户
  findUserById(id, function (err, user) {
    done(err, user);
  });
});

// 用于解析JSON格式的请求体
app.use(express.json());

// User 表的操作
app.use("/api/users", usersRouter);
// news 表的操作
app.use("/api/news", newsRouter);
// feedback 表的操作
app.use("/api/feedback", feedBackRouter);
// materials 表的操作
app.use("/api/materials", materialsRouter);
// exam 表的操作
app.use("/api/exams", examRouter);
// plans 表的操作
app.use("/api/plans", plansRouter);
// learning_progress 表的操作
app.use("/api/learning_progress", learning_progressRouter);

app.listen(4000, () => {
  console.log(`服务已经启动了`);
});
