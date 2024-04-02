import React, { useState, useEffect } from "react";
import {
  Card,
  Spin,
  Descriptions,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
} from "antd";
import MyPieChart from "../../../components/MyPieChart";
import axios from "axios";
import "./index.css";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [feedbackForm] = Form.useForm();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userId = localStorage.getItem("userId");
      try {
        const response = await axios.get(
          `http://localhost:4000/api/users/userinfo/${userId}`
        );
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error("获取用户信息失败:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const showChangePasswordModal = () => {
    setIsModalVisible(true);
  };

  const handleChangePassword = async (values) => {
    try {
      await axios.post("http://localhost:4000/api/users/changepassword", {
        userId: localStorage.getItem("userId"), // 从localStorage中获取当前登录用户的ID
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success("密码修改成功！");
      setIsModalVisible(false);
    } catch (error) {
      // 错误处理
      if (error.response && error.response.data) {
        message.error(error.response.data.message);
      } else {
        message.error("密码修改失败，请稍后再试！");
      }
      console.error("修改密码失败:", error);
    }
  };

  const showFeedbackModal = () => {
    setIsFeedbackModalVisible(true);
  };

  const handleFeedbackSubmit = async (values) => {
    try {
      await axios.post("http://localhost:4000/api/feedback/add", {
        username: user.Username, // 用户名
        type: values.type, // 反馈类型
        content: values.content, // 反馈内容
      });
      message.success("反馈提交成功！");
      setIsFeedbackModalVisible(false);
    } catch (error) {
      message.error("反馈提交失败，请稍后再试！");
      console.error("提交反馈失败:", error);
    }
  };

  if (loading) {
    return <Spin />;
  }

  // 隐藏电话号码中间四位
  const maskPhone = (phone) => phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");

  return (
    <div className="user-profile-container">
      <Card title="个人信息" className="user-info-card">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="用户名">{user.Username}</Descriptions.Item>
          <Descriptions.Item label="电话">
            {maskPhone(user.Phone)}
          </Descriptions.Item>
          <Descriptions.Item label="注册时间">
            {new Date(user.RegisterTime).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
        <Button type="primary" onClick={showChangePasswordModal}>
          修改密码
        </Button>
        <Button type="default" onClick={showFeedbackModal}>
          用户反馈
        </Button>
      </Card>

      <Card title="学习进度" className="user-progress-card">
        <MyPieChart userId={user.UserId} />
      </Card>

      <Modal
        title="修改密码"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="确认"
        cancelText="取消"
      >
        <Form form={form} onFinish={handleChangePassword}>
          <Form.Item
            name="oldPassword"
            label="旧密码"
            rules={[{ required: true, message: "请输入旧密码" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[{ required: true, message: "请输入新密码" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmNewPassword"
            label="确认新密码"
            dependencies={["newPassword"]}
            hasFeedback
            rules={[
              { required: true, message: "请再次输入新密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不匹配!"));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="用户反馈"
        open={isFeedbackModalVisible}
        onCancel={() => setIsFeedbackModalVisible(false)}
        onOk={() => feedbackForm.submit()}
        okText="确认"
        cancelText="取消"
      >
        <Form form={feedbackForm} onFinish={handleFeedbackSubmit}>
          <Form.Item
            name="type"
            label="反馈类型"
            rules={[{ required: true, message: "请选择反馈类型" }]}
          >
            <Select>
              <Select.Option value="bug">Bug</Select.Option>
              <Select.Option value="优化">优化</Select.Option>
              <Select.Option value="表扬">表扬</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="content"
            label="反馈内容"
            rules={[{ required: true, message: "请输入反馈内容" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserProfile;
