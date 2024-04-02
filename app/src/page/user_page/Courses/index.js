// Courses.js
import React, { useState, useEffect } from "react";
import { Card, Select, List, Typography } from "antd";
import axios from "axios";
import "./index.css";

const { Option } = Select;
const { Text } = Typography;

const Courses = () => {
  const [materials, setMaterials] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("所有");
  const [selectedType, setSelectedType] = useState("所有");

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/materials/get"
      );
      setMaterials(response.data);
    } catch (error) {
      console.error("Failed to fetch materials:", error);
    }
  };

  const filteredMaterials = materials.filter(
    (material) =>
      (selectedCategory === "所有" || material.Category === selectedCategory) &&
      (selectedType === "所有" || material.MaterialType === selectedType)
  );

  return (
    <div className="courses-container">
      <Card title="学习资料" className="courses-card">
        <div className="filters">
          <label className="filter-label">
            <Text type="secondary">课程类别：</Text>
            <Select
              // defaultValue="所有"
              style={{ width: 120 }}
              onChange={setSelectedCategory}
              placeholder="选择课程类别"
            >
              <Option value="所有">所有</Option>
              <Option value="行测">行测</Option>
              <Option value="申论">申论</Option>
            </Select>
          </label>
          <label className="filter-label">
            <Text type="secondary">资料类型：</Text>
            <Select
              // defaultValue="所有"
              style={{ width: 120, marginLeft: 20 }}
              onChange={setSelectedType}
              placeholder="选择资料类型"
            >
              <Option value="所有">所有</Option>
              <Option value="PDF">PDF</Option>
              <Option value="Video">视频</Option>
            </Select>
          </label>
        </div>
        <List
          itemLayout="horizontal"
          dataSource={filteredMaterials}
          renderItem={(item) => (
            <List.Item
              actions={[
                <a
                  href={encodeURI(item.FileUrl)}
                  download={item.FileName}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  下载
                </a>,
              ]}
            >
              <List.Item.Meta
                title={
                  <a
                    href={encodeURI(item.FileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.FileName}
                  </a>
                }
                description={`文件类型: ${item.MaterialType}, 课程类别: ${item.Category}`}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Courses;
