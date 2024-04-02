const mammoth = require("mammoth");
const fs = require("fs");

function processText(text) {
  const questions = [];
  const questionRegex = /\d+\..+?(?=\d+\.|$)/gs;

  let match;
  while ((match = questionRegex.exec(text)) !== null) {
    questions.push(match[0].trim());
  }

  return questions.map((question) => {
    const split = question.split(/(?=[A-D]\.)/);
    const questionText = split[0].trim();
    const options = split.slice(1).map((opt) => opt.trim());
    return {
      question: questionText,
      options: options,
    };
  });
}

mammoth
  .extractRawText({ path: "2023年北京市公务员录用考试《行测》.docx" })
  .then((result) => {
    const text = result.value; // 提取的文本
    const questions = processText(text);

    fs.writeFile("output.json", JSON.stringify(questions, null, 4), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("已成功保存题目内容到JSON文件。");
    });
  })
  .catch((err) => {
    console.error(err);
  });
