const express = require("express");
const router = express.Router();
const db = require("../db/db");
const qiniuUtils = require("../utils/qiniu");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const axios = require("axios");
const mammoth = require("mammoth");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// 获取模拟测试列表（根据类型）
router.get("/get", (req, res) => {
  const { type } = req.query;
  let sql = "SELECT * FROM exams";
  const params = [];

  if (type && type !== "所有") {
    sql += " WHERE Type = ?";
    params.push(type);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).send("查询模拟测试失败");
    }
    res.json(results);
  });
});

// 添加模拟测试
router.post(
  "/add",
  upload.fields([{ name: "file" }, { name: "answerFile" }]),
  async (req, res) => {
    const { Title, Type } = req.body;
    const localFile = req.files["file"][0].path;
    const answerFile = req.files["answerFile"]
      ? req.files["answerFile"][0].path
      : null;

    try {
      const key = `exams/${Date.now()}-${encodeURIComponent(
        req.files["file"][0].originalname
      )}`;
      const uploadResponse = await qiniuUtils.uploadFile(key, localFile);
      const FileUrl = `http://saw8e2h5g.hb-bkt.clouddn.com/${encodeURIComponent(
        uploadResponse.key
      )}`;

      let AnswerUrl = null;
      if (answerFile) {
        const answerKey = `answers/${Date.now()}-${encodeURIComponent(
          req.files["answerFile"][0].originalname
        )}`;
        const answerUploadResponse = await qiniuUtils.uploadFile(
          answerKey,
          answerFile
        );
        AnswerUrl = `http://saw8e2h5g.hb-bkt.clouddn.com/${encodeURIComponent(
          answerUploadResponse.key
        )}`;
      }

      const sql =
        "INSERT INTO exams (Title, FileUrl, AnswerUrl, Type) VALUES (?, ?, ?, ?)";
      db.query(sql, [Title, FileUrl, AnswerUrl, Type], (err) => {
        if (err) {
          console.log(err);
          return res.status(500).send("添加模拟测试失败");
        }
        res.json({
          message: "模拟测试添加成功",
          fileUrl: FileUrl,
          answerUrl: AnswerUrl,
        });
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("上传文件到七牛云失败");
    }
  }
);

// 删除模拟测试
router.delete("/del/:id", (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT FileUrl, AnswerUrl FROM exams WHERE ExamId = ?",
    [id],
    async (err, results) => {
      if (err || results.length === 0) {
        return res.status(500).send("找不到要删除的文件");
      }

      try {
        const fileUrl = results[0].FileUrl;
        const fileKey = "exams/" + decodeURIComponent(fileUrl).split("/").pop();
        await qiniuUtils.deleteFile(fileKey);

        if (results[0].AnswerUrl) {
          const answerUrl = results[0].AnswerUrl;
          const answerKey =
            "answers/" + decodeURIComponent(answerUrl).split("/").pop();
          await qiniuUtils.deleteFile(answerKey);
        }

        db.query("DELETE FROM exams WHERE ExamId = ?", [id], (err) => {
          if (err) {
            return res.status(500).send("删除模拟测试失败");
          }
          res.json({ message: "模拟测试删除成功" });
        });
      } catch (error) {
        console.log("删除七牛云文件失败:", error);
        res.status(500).send("删除七牛云文件失败");
      }
    }
  );
});

// 修改模拟测试
router.put(
  "/update/:id",
  upload.fields([{ name: "file" }, { name: "answerFile" }]),
  async (req, res) => {
    const { id } = req.params;
    const { Title, Type } = req.body;

    try {
      const sqlQuery =
        "SELECT FileUrl, AnswerFileUrl FROM exams WHERE ExamId = ?";
      const oldFile = await new Promise((resolve, reject) => {
        db.query(sqlQuery, [id], (err, results) => {
          if (err || results.length === 0) {
            reject("找不到要更新的文件");
          } else {
            resolve(results[0]);
          }
        });
      });

      let FileUrl = oldFile.FileUrl;
      let AnswerFileUrl = oldFile.AnswerFileUrl;

      if (req.files["file"]) {
        const localFile = req.files["file"][0].path;
        const key = `exams/${Date.now()}-${encodeURIComponent(
          req.files["file"][0].originalname
        )}`;
        const uploadResponse = await qiniuUtils.uploadFile(key, localFile);
        FileUrl = `http://saw8e2h5g.hb-bkt.clouddn.com/${encodeURIComponent(
          uploadResponse.key
        )}`;
        const fileKey = "exams/" + oldFile.FileUrl.split("/").pop();
        await qiniuUtils.deleteFile(fileKey);
      }

      if (req.files["answerFile"]) {
        const answerFile = req.files["answerFile"][0].path;
        const answerKey = `answers/${Date.now()}-${encodeURIComponent(
          req.files["answerFile"][0].originalname
        )}`;
        const answerUploadResponse = await qiniuUtils.uploadFile(
          answerKey,
          answerFile
        );
        AnswerFileUrl = `http://saw8e2h5g.hb-bkt.clouddn.com/${encodeURIComponent(
          answerUploadResponse.key
        )}`;
        if (oldFile.AnswerFileUrl) {
          const answerFileKey =
            "answers/" + oldFile.AnswerFileUrl.split("/").pop();
          await qiniuUtils.deleteFile(answerFileKey);
        }
      }

      const sqlUpdate =
        "UPDATE exams SET Title = ?, FileUrl = ?, AnswerFileUrl = ?, Type = ? WHERE ExamId = ?";
      db.query(sqlUpdate, [Title, FileUrl, AnswerFileUrl, Type, id], (err) => {
        if (err) {
          console.log(err);
          return res.status(500).send("修改模拟测试失败");
        }
        res.json({ message: "模拟测试修改成功" });
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("处理模拟测试更新失败");
    }
  }
);

function processText(text) {
  const questions = [];
  const questionRegex = /(\d+\.\s)(.*?)(?=\d+\.\s|$)/gs;

  let match;
  while ((match = questionRegex.exec(text)) !== null) {
    const fullQuestion = match[0];
    const parts = fullQuestion.split(/(?=[A-D]\.)/);
    parts.forEach((part, index) => {
      parts[index] = part.replace(/\n/g, " ");
    });
    const questionText = parts[0].trim();
    const options = parts.slice(1).map((opt) => opt.trim());
    questions.push({
      question: questionText,
      options: options,
    });
  }

  return questions;
}

// 从七牛云下载文件并转换为JSON
router.get("/get-exam-content/:id", (req, res) => {
  const { id } = req.params;

  // 从数据库获取文件URL
  db.query(
    "SELECT FileUrl FROM exams WHERE ExamId = ?",
    [id],
    async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send("查询考试文件时出现错误");
      }

      if (results.length === 0) {
        return res.status(404).send("未找到指定的考试文件");
      }

      const fileUrl = results[0].FileUrl;

      try {
        // 从七牛云下载文件
        const response = await axios.get(fileUrl, {
          responseType: "arraybuffer",
        });
        const buffer = Buffer.from(response.data);

        // 使用mammoth将buffer转换为文本
        const docResult = await mammoth.extractRawText({ buffer: buffer });
        const text = docResult.value;

        // 将文本转换为题目
        const questions = processText(text);
        res.json(questions);
      } catch (err) {
        console.error(err);
        res.status(500).send("处理考试内容时出现错误");
      }
    }
  );
});

// 解析纯文本答案文件的函数
function parsePlainTextAnswers(answerText) {
  // 使用正则表达式来匹配所有答案项
  const regex = /(\d+)\.([A-D])/g;
  let match;
  const answerMap = {};
  let answerstr = "";
  // 循环匹配所有答案项
  while ((match = regex.exec(answerText)) !== null) {
    // match[1] 是问题编号，match[2] 是答案
    const questionIndex = match[1];
    const answer = match[2];
    answerstr += questionIndex + ":" + answer + " ";
    answerMap[questionIndex] = answer;
  }

  return { answerMap, answerstr };
}

// 提交考试答案并评分的路由
router.post("/submit/:id", async (req, res) => {
  const { id } = req.params;
  const { answers } = req.body;
  console.log("提交的答案:", answers);

  try {
    // 从数据库获取答案文件的URL
    const result = await new Promise((resolve, reject) => {
      db.query(
        "SELECT AnswerUrl FROM exams WHERE ExamId = ?",
        [id],
        (err, results) => {
          if (err || results.length === 0) reject("未找到考试答案文件");
          else resolve(results[0]);
        }
      );
    });

    const { AnswerUrl } = result;

    // 从七牛云下载答案文件
    const response = await axios.get(AnswerUrl, {
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(response.data);

    // 将buffer转换为文本
    const docResult = await mammoth.extractRawText({ buffer: buffer });
    const answerText = docResult.value;
    // 解析答案文件
    const { answerMap, answerstr } = parsePlainTextAnswers(answerText);
    // 对答案进行评分
    let correctAnswers = 0;
    Object.keys(answers).forEach((questionIndex) => {
      const answer = answers[questionIndex].charAt(0).toUpperCase();
      const correctAnswer = answerMap[parseInt(questionIndex) + 1];
      if (answer === correctAnswer) {
        correctAnswers++;
      }
    });

    // 计算得分
    const score = (correctAnswers / Object.keys(answerMap).length) * 100;

    res.json({ score, answerstr });
  } catch (error) {
    console.error(error);
    res.status(500).send("处理提交的答案时发生错误");
  }
});

// 函数用于存储错题信息
function storeErrorQuestion(userId, questionId, userAnswer, correctAnswer) {
  const sql = `
    INSERT INTO error_questions (UserId, QuestionId, UserAnswer, CorrectAnswer)
    VALUES (?, ?, ?, ?)`;

  db.query(sql, [userId, questionId, userAnswer, correctAnswer], (err) => {
    if (err) {
      console.error("存储错题信息失败：", err);
    }
  });
}

module.exports = router;
