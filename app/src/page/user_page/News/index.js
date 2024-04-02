import React, { useEffect, useState } from "react";
import { Select, List, Typography, Card } from "antd";
import axios from "axios";
import "./index.css";

const { Title } = Typography;
const { Option } = Select;

const News = () => {
  const [newsList, setNewsList] = useState([]);
  const [categories, setCategories] = useState(["所有"]);
  const [selectedCategory, setSelectedCategory] = useState("所有");

  useEffect(() => {
    fetchCategories();
  }, [selectedCategory]);

  useEffect(() => {
    fetchNews(selectedCategory);
  }, [selectedCategory]);

  const fetchCategories = async () => {
    const categoriesResponse = await axios.get(
      "http://localhost:4000/api/news/categories"
    );
    setCategories(["所有", ...categoriesResponse.data]);
  };

  const fetchNews = async (category) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/news/get?category=${category}`
      );
      setNewsList(response.data);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    }
  };

  return (
    <div className="news-container">
      <Card className="news-card">
        <div className="news-header">
          <Title level={3}>最新资讯</Title>
          <Select
            defaultValue="所有"
            onChange={setSelectedCategory}
            style={{ width: 120 }}
          >
            {categories.map((category) => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
          </Select>
        </div>
        <List
          itemLayout="vertical"
          size="small"
          dataSource={newsList}
          renderItem={(item) => (
            <List.Item key={item.NewsId} className="news-list-item">
              <Title level={4} className="news-title">
                <a href={item.Url} target="_blank" rel="noopener noreferrer">
                  {item.Title}
                </a>
              </Title>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default News;
