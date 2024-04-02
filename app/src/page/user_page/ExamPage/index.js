import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Modal } from "antd";
import axios from "axios";
import "./index.css";

const ExamPage = () => {
  const { examId } = useParams();
  const [examQuestions, setExamQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const location = useLocation();
  const [timeLeft, setTimeLeft] = useState(7200); // 假设考试时间为2小时
  const [timerId, setTimerId] = useState(null); // 新增用于存储计时器ID的状态
  const [result, setResult] = useState(null);
  const examInfo = location.state.exam;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExamContent(examId);
  }, [examId]);

  useEffect(() => {
    const timer =
      timeLeft > 0 && setInterval(() => setTimeLeft(timeLeft - 1), 1000);
    setTimerId(timer); // 存储计时器ID
    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchExamContent = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/exams/get-exam-content/${id}`
      );
      // console.log(response.data);
      setExamQuestions(response.data);
      // 初始化用户答案
      const initialAnswers = {};
      response.data.forEach((question, index) => {
        initialAnswers[index] = "";
      });
      setUserAnswers(initialAnswers);
    } catch (error) {
      console.error("Failed to fetch exam content:", error);
    }
  };

  const handleOptionChange = (questionIndex, option) => {
    setUserAnswers({
      ...userAnswers,
      [questionIndex]: option,
    });
  };

  // 更新显示结果的函数
  const showResultModal = () => {
    setIsModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // 更新提交逻辑
  const handleSubmit = async () => {
    if (timeLeft > 0) {
      clearInterval(timerId); // 使用 timerId 停止计时器
    }

    try {
      const response = await axios.post(
        `http://localhost:4000/api/exams/submit/${examId}`,
        {
          answers: userAnswers,
        }
      );
      setResult(response.data); // 存储考试结果
      showResultModal();
    } catch (error) {
      console.error("Failed to submit exam:", error);
      alert("提交考试失败，请重试！");
    }
  };

  // 渲染考试结果
  const renderResultModal = () => {
    return (
      <Modal
        title="考试结果"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null} // 不显示默认的底部按钮
      >
        <p>得分: {result ? result.score : "正在计算..."}</p>
        {/* 这里可以添加显示答案的逻辑 */}
        <p>答案：{result ? result.answerstr : " "}</p>
      </Modal>
    );
  };

  const handleExit = () => {
    navigate("/user/home/exams"); // 跳转到首页或其他页面
  };

  return (
    <div className="exam-container">
      <h1 className="exam-title">{examInfo.Title}</h1>
      <div className="timer">
        剩余时间:{" "}
        <span className="time">
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </span>
      </div>
      <button className="exit-button" onClick={handleExit}>
        退出考试
      </button>
      <form
        className="exam-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {examQuestions.map((question, index) => (
          <div key={index} className="question">
            <p className="question-text">{question.question}</p>
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="option">
                <input
                  type="radio"
                  id={`${index}_${optionIndex}`}
                  name={`question_${index}`}
                  value={option}
                  checked={userAnswers[index] === option}
                  onChange={() => handleOptionChange(index, option)}
                />
                <label htmlFor={`${index}_${optionIndex}`}>{option}</label>
              </div>
            ))}
          </div>
        ))}
        <button type="submit" className="submit-button">
          提交试卷
        </button>
      </form>
      {renderResultModal()}
    </div>
  );
};

export default ExamPage;
