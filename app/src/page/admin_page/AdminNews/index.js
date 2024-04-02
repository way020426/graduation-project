import React, { useEffect, useState } from "react";
import { Table, Button, message, Modal, Form, Input, Select } from "antd";
import axios from "axios";
import "./index.css";

const News = () => {
  const [news, setNews] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [form] = Form.useForm();
  const [selectedCategory, setSelectedCategory] = useState("所有");
  const [categories, setCategories] = useState([
    "所有",
    "考试通知",
    "政策变动",
  ]);

  useEffect(() => {
    fetchCategories();
    fetchNews(selectedCategory);
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/news/categories"
      );
      setCategories(["所有", ...response.data]);
    } catch (error) {
      message.error("加载分类数据失败");
    }
  };

  const fetchNews = async (category) => {
    let url = "http://localhost:4000/api/news/get";
    if (category && category !== "所有") {
      url += `?category=${category}`;
    }
    try {
      const response = await axios.get(url);
      setNews(response.data);
    } catch (error) {
      message.error("加载资讯数据失败");
    }
  };

  const showModal = (newsItem) => {
    if (newsItem) {
      setEditingNews(newsItem);
      form.setFieldsValue(newsItem);
    } else {
      setEditingNews(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const addOrUpdateNews = async (values) => {
    try {
      if (editingNews) {
        await axios.put(
          `http://localhost:4000/api/news/update/${editingNews.NewsId}`,
          values
        );
      } else {
        await axios.post("http://localhost:4000/api/news/add", values);
      }
      fetchNews();
      setIsModalVisible(false);
      form.resetFields();
      setEditingNews(null);
      message.success("操作成功");
    } catch (error) {
      message.error("操作失败");
    }
  };

  const deleteNews = async (NewsId) => {
    try {
      await axios.delete(`http://localhost:4000/api/news/del/${NewsId}`);
      fetchNews();
      message.success("删除成功");
    } catch (error) {
      message.error("删除失败");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingNews(null);
  };

  const columns = [
    { title: "ID", dataIndex: "NewsId", key: "NewsId" },
    { title: "标题", dataIndex: "Title", key: "Title" },
    { title: "类型", dataIndex: "Category", key: "Category" },
    { title: "链接", dataIndex: "Url", key: "Url" },
    { title: "上传时间", dataIndex: "UploadTime", key: "UploadTime" },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <>
          <Button onClick={() => showModal(record)}>编辑</Button>
          <Button danger onClick={() => deleteNews(record.NewsId)}>
            删除
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" onClick={() => showModal()}>
        添加资讯
      </Button>
      <Select
        defaultValue="所有"
        style={{ width: 120, marginBottom: 16 }}
        onChange={setSelectedCategory}
      >
        {categories.map((category) => (
          <Select.Option key={category} value={category}>
            {category}
          </Select.Option>
        ))}
      </Select>

      <Table
        className="news-table"
        dataSource={news}
        columns={columns}
        rowKey="NewsId"
      />
      <Modal
        className="news-modal"
        title={editingNews ? "编辑资讯" : "添加资讯"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          className="news-modal-form"
          form={form}
          initialValues={editingNews || {}}
          onFinish={addOrUpdateNews}
          layout="vertical"
        >
          <Form.Item
            name="Title"
            label="标题"
            rules={[{ required: true, message: "请输入标题!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="Content" label="内容">
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="Category"
            label="分类"
            rules={[{ required: true, message: "请选择分类!" }]}
          >
            <Select>
              {/* 这里应该从状态中加载分类选项 */}
              <Select.Option value="考试通知">考试通知</Select.Option>
              <Select.Option value="政策变动">政策变动</Select.Option>
              {/* ...其他分类 */}
            </Select>
          </Form.Item>
          <Form.Item
            name="Url"
            label="链接"
            rules={[{ required: true, message: "请输入链接!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default News;
