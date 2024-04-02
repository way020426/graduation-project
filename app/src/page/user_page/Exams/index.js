import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { List, Button, Select } from "antd";
import axios from "axios";
import "./index.css";

const Exams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [selectedType, setSelectedType] = useState("所有");

  useEffect(() => {
    fetchExams(selectedType);
  }, [selectedType]);

  const fetchExams = async (type) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/exams/get?type=${type}`
      );
      setExams(response.data);
    } catch (error) {
      console.error("Failed to fetch exams:", error);
    }
  };

  const startExam = (exam) => {
    navigate(`/exam/${exam.ExamId}`, { state: { exam } });
  };

  return (
    <div className="exams-container">
      <h1 className="exams-heading">模拟测试</h1>
      <Select
        defaultValue="所有"
        style={{ width: 150, marginBottom: 20 }}
        onChange={setSelectedType}
      >
        <Select.Option value="所有">所有</Select.Option>
        <Select.Option value="行测">行测</Select.Option>
        <Select.Option value="申论">申论</Select.Option>
      </Select>
      <List
        itemLayout="horizontal"
        dataSource={exams}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                key="start"
                type="primary"
                onClick={() => {
                  startExam(item);
                }}
              >
                开始考试
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={<span className="exam-title">{item.Title}</span>}
              description={
                <span className="exam-type">考试类型: {item.Type}</span>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default Exams;
