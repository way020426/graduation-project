import React, { useState } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, Card, message, Select } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "../../store/modules/loginStore";
import "./index.css";

const Login = () => {
  const dispatch = useDispatch();
  // 设置一个 type 状态，用来判断是用户登录还是管理员登录
  const [type, setType] = useState("user");
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { Option } = Select;

  // onFinish 函数用于处理表单提交
  const onFinish = async (values) => {
    // console.log("接收到表单的值: ", values);
    const loginValues = { ...values, type };
    try {
      // 发送POST请求到后端登录接口
      const response = await axios.post(
        "http://localhost:4000/api/users/login",
        loginValues
      );
      // console.log("后端返回的数据:", response.data);
      // 登录成功的处理
      message.success(response.data.message);
      localStorage.setItem("userId", response.data.userId);
      dispatch(login());
      // 登录成功后跳转到首页
      type === "user"
        ? navigate("/user/home/main")
        : navigate("/admin/home/users");
      // navigate("/home/news");
    } catch (error) {
      // 登录失败的处理
      if (error.response) {
        console.error("登录失败:", error.response.data);
        // 根据状态码显示不同的错误消息
        if (error.response.status === 401) {
          message.error("密码错误");
        } else if (error.response.status === 404) {
          message.error("用户不存在");
        } else {
          message.error(error.response.data);
        }
      } else {
        console.error("请求错误:", error.message);
        message.error("登录请求失败");
      }
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" title="欢迎使用本系统请登录">
        <Form
          form={form}
          name="normal_login"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "请输入用户名!" }]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="用户名"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入密码!" }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="密码"
            />
          </Form.Item>
          {/* 登录类型选择 */}
          <Form.Item name="type" initialValue="user">
            <Select onChange={(value) => setType(value)}>
              <Option value="user">用户登录</Option>
              <Option value="admin">管理员登录</Option>
            </Select>
          </Form.Item>
          {/* 登录 注册按钮 */}
          <Form.Item className="button-container">
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
            >
              登录
            </Button>
            <Button type="link" onClick={() => navigate("/register")}>
              注册
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
