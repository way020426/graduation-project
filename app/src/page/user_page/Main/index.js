import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  List,
  Card,
  Col,
  Row,
  Calendar,
  Radio,
  Space,
  Button,
  Select,
  Layout,
} from "antd";
import {
  BookOutlined,
  FilePdfOutlined,
  VideoCameraOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "./index.css";

const Main = () => {
  const [selectedCategory, setSelectedCategory] = useState("所有");
  const [categories, setCategories] = useState([]);
  const [newsData, setNewsData] = useState([]);
  const [materialType, setMaterialType] = useState("PDF");
  const [materials, setMaterials] = useState([]);
  const [plans, setPlans] = useState([]);
  const { Content } = Layout;
  const navigate = useNavigate();

  // 获取学习计划
  useEffect(() => {
    const fetchPlans = async () => {
      const userId = localStorage.getItem("userId");
      try {
        const response = await axios.get(
          `http://localhost:4000/api/plans/get`,
          {
            headers: { "user-id": userId },
          }
        );
        setPlans(response.data);
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      }
    };

    fetchPlans();
  }, []);

  // 获取学习资料
  useEffect(() => {
    fetchMaterials(materialType);
  }, [materialType]);

  const fetchMaterials = async (type) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/materials/get?type=${type}`
      );
      setMaterials(response.data);
    } catch (error) {
      console.error("Failed to fetch materials:", error);
    }
  };

  // 获取资讯分类
  useEffect(() => {
    axios
      .get("http://localhost:4000/api/news/categories")
      .then((response) => {
        setCategories(["所有", ...response.data]);
      })
      .catch((error) => console.error("Failed to fetch categories:", error));
  }, []);

  // 获取所有资讯
  useEffect(() => {
    fetchNewsByCategory(selectedCategory);
  }, [selectedCategory]);
  // 获取特定分类的资讯
  const fetchNewsByCategory = (category) => {
    let url = "http://localhost:4000/api/news/get";
    if (category && category !== "所有") {
      url += `?category=${category}`;
    }
    axios
      .get(url)
      .then((response) => setNewsData(response.data))
      .catch((error) => console.error("Failed to fetch news:", error));
  };

  // 状态对照
  const translateStatus = (status) => {
    const statusMap = {
      "Not Started": "未开始",
      "In Progress": "进行中",
      Completed: "完成",
      Paused: "暂停",
      Cancelled: "取消",
    };
    return statusMap[status] || status;
  };

  // 渲染学习计划列表
  const renderPlans = () => {
    const displayedPlans = plans.slice(0, 5);

    if (displayedPlans.length === 0) {
      return <p>没有学习计划。</p>;
    }

    return (
      <>
        <List
          dataSource={displayedPlans}
          renderItem={(plan, index) => (
            <List.Item key={index} className="plan-details">
              <span>{`名称：${plan.PlanDescription}`}</span>
              <span>{`时间：${plan.DailyStudyTime}小时`}</span>
              <span>{`状态：${translateStatus(plan.Status)}`}</span>
            </List.Item>
          )}
        />
        {plans.length > 5 && (
          <a className="more-plans" href="/user/home/plan">
            更多...
          </a>
        )}
      </>
    );
  };

  // 学习资料列表
  const MaterialsList = ({
    materials,
    materialType,
    setMaterialType,
    onMoreClick,
  }) => {
    const displayedMaterials = materials.slice(0, 5);
    return (
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>课程学习</span>
            <Radio.Group
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              style={{ marginBottom: 20 }}
            >
              <Radio.Button value="PDF">
                <FilePdfOutlined /> PDF
              </Radio.Button>
              <Radio.Button value="Video">
                <VideoCameraOutlined /> 视频
              </Radio.Button>
            </Radio.Group>
          </div>
        }
      >
        <List
          dataSource={displayedMaterials}
          renderItem={(item, index) => (
            <List.Item key={index}>
              <a href={item.FileUrl} target="_blank" rel="noopener noreferrer">
                {item.FileName}
              </a>
            </List.Item>
          )}
        />
        {materials.length > 5 && (
          <a
            className="more-materials"
            href="/user/home/courses"
            onClick={onMoreClick}
          >
            更多...
          </a>
        )}
      </Card>
    );
  };

  // 资讯列表
  const NewsList = ({
    newsData,
    onMoreClick,
    categories,
    selectedCategory,
    setSelectedCategory,
  }) => {
    const displayedNews = newsData.slice(0, 5);
    return (
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>最新资讯</span>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              style={{ width: 120 }}
            >
              {categories.map((category) => (
                <Select.Option key={category} value={category}>
                  {category}
                </Select.Option>
              ))}
            </Select>
          </div>
        }
        bordered={false}
      >
        <List
          dataSource={displayedNews}
          renderItem={(item, index) => (
            <List.Item key={index}>
              <a href={item.Url} target="_blank" rel="noopener noreferrer">
                {item.Title}
              </a>
            </List.Item>
          )}
        />
        {newsData.length > 5 && (
          <a className="more-news" href="/user/home/news" onClick={onMoreClick}>
            更多...
          </a>
        )}
      </Card>
    );
  };

  return (
    <>
      <Content>
        <Row gutter={16} className="site-content-row">
          <Col span={16}>
            {/* 咨询列表 */}
            <NewsList
              newsData={newsData}
              onMoreClick={() => navigate("/news")}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={(category) => {
                setSelectedCategory(category);
                fetchNewsByCategory(category);
              }}
            />
            {/* 课程学习 */}
            <MaterialsList
              materials={materials}
              materialType={materialType}
              setMaterialType={setMaterialType}
              onMoreClick={() => {
                navigate("/user/home/courses");
              }}
            />
          </Col>
          <Col span={8}>
            {/* 日历 */}
            <Card title="学习日历" bordered={false}>
              <Calendar fullscreen={false} />
            </Card>
            {/* 学习计划 */}
            <Card title="学习计划" bordered={false}>
              <List>{renderPlans()}</List>
            </Card>
            {/* 其他功能 */}
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button type="primary" icon={<InfoCircleOutlined />} block>
                模拟测试
              </Button>
              <Button type="danger" icon={<BookOutlined />} block>
                错题集
              </Button>
            </Space>
          </Col>
        </Row>
      </Content>
    </>
  );
};

export default Main;
