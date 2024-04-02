import React, { useEffect, useState } from "react";
import { Table, message, Select } from "antd";
import axios from "axios";
import "./index.css";

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedType, setSelectedType] = useState("所有");

  useEffect(() => {
    fetchFeedbacks(selectedType);
  }, [selectedType]);

  const fetchFeedbacks = async (type) => {
    try {
      const url =
        type === "所有"
          ? "http://localhost:4000/api/feedback/get"
          : `http://localhost:4000/api/feedback/get?type=${type}`;
      const response = await axios.get(url);
      setFeedbacks(response.data);
    } catch (error) {
      message.error("加载反馈数据失败");
    }
  };

  const columns = [
    { title: "用户名", dataIndex: "Username", key: "Username" },
    { title: "反馈内容", dataIndex: "Content", key: "Content" },
    { title: "反馈时间", dataIndex: "FeedbackTime", key: "FeedbackTime" },
    { title: "类型", dataIndex: "Type", key: "Type" },
  ];

  return (
    <div className="feedback-table-container">
      <Select
        defaultValue="所有"
        style={{ width: 120, marginBottom: 16 }}
        onChange={setSelectedType}
      >
        <Select.Option value="所有">所有</Select.Option>
        <Select.Option value="bug">Bug</Select.Option>
        <Select.Option value="优化">优化</Select.Option>
        <Select.Option value="表扬">表扬</Select.Option>
      </Select>
      <Table dataSource={feedbacks} columns={columns} rowKey="FeedbackId" />
    </div>
  );
};

export default Feedback;
