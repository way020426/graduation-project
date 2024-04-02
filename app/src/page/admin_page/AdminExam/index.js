import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Select,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "./index.css";

const Exam = () => {
  const [exams, setExams] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/exams/get");
      setExams(response.data);
    } catch (error) {
      message.error("加载模拟测试失败");
    }
  };

  const deleteExam = async (examId) => {
    try {
      await axios.delete(`http://localhost:4000/api/exams/del/${examId}`);
      fetchExams();
      message.success("模拟测试删除成功");
    } catch (error) {
      message.error("删除模拟测试失败");
    }
  };

  const showModal = (exam = null) => {
    setCurrentExam(exam);
    setIsModalVisible(true);
    if (exam) {
      form.setFieldsValue({
        Title: exam.Title,
        Type: exam.Type,
      });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setCurrentExam(null);
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("Title", values.Title);
    formData.append("Type", values.Type);
    if (values.file) {
      formData.append("file", values.file.file);
    }
    if (values.answerFile) {
      formData.append("answerFile", values.answerFile.file);
    }

    try {
      if (currentExam) {
        await axios.put(
          `http://localhost:4000/api/exams/update/${currentExam.ExamId}`,
          formData
        );
      } else {
        await axios.post("http://localhost:4000/api/exams/add", formData);
      }
      fetchExams();
      message.success(`模拟测试${currentExam ? "修改" : "上传"}成功`);
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error(`模拟测试${currentExam ? "修改" : "上传"}失败`);
    }
  };

  const columns = [
    {
      title: "文件名",
      dataIndex: "Title",
      key: "Title",
    },
    {
      title: "试卷类型",
      dataIndex: "Type",
      key: "Type",
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            style={{ marginRight: 8 }}
          >
            修改
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => deleteExam(record.ExamId)}
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="exam-container">
      <Button
        icon={<UploadOutlined />}
        onClick={() => showModal()}
        style={{ marginBottom: 16 }}
      >
        上传模拟测试
      </Button>
      <Table dataSource={exams} columns={columns} rowKey="ExamId" />

      <Modal
        title={`${currentExam ? "修改" : "上传"}模拟测试`}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={form.submit}
        okText="提交"
        cancelText="取消"
      >
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item
            name="Title"
            label="文件名"
            rules={[{ required: true, message: "请输入文件名" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="Type"
            label="试卷类型"
            rules={[{ required: true, message: "请选择试卷类型" }]}
          >
            <Select>
              <Select.Option value="行测">行测</Select.Option>
              <Select.Option value="申论">申论</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="file" label="文件">
            <Upload maxCount={1} beforeUpload={() => false}>
              <Button>点击上传</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="answerFile" label="答案文件">
            <Upload maxCount={1} beforeUpload={() => false}>
              <Button>点击上传答案</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Exam;
