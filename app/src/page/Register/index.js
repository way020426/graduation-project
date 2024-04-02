import React from "react";
import { Form, Input, Button, message, Card } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./index.css";

const Register = () => {
  // useNavigate 函数用于页面跳转
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // onFinish 函数用于处理表单提交
  const onFinish = async (values) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/users/register",
        values
      );
      console.log(response.data.message);
      message.success(response.data.message);
      // 在此处跳转到登录页面
      navigate("/");
    } catch (error) {
      if (error.response) {
        console.error("注册失败:", error.response.data);
        message.error(error.response.data); // 显示后端返回的错误消息
      } else {
        console.error("请求错误:", error.message);
        message.error("注册请求失败");
      }
    }
  };

  return (
    <div className="register-container">
      <Card className="register-card" title="用户注册">
        <Form
          form={form}
          name="register"
          className="register-form"
          onFinish={onFinish}
          scrollToFirstError
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "请输入用户名!" }]}
          >
            <Input placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入密码!" }]}
            hasFeedback
          >
            <Input.Password placeholder="密码" />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "请确认你的密码!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不匹配!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="确认密码" />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[{ required: true, message: "请输入手机号!" }]}
          >
            <Input placeholder="手机号" />
          </Form.Item>

          <Form.Item className="button-container">
            <Button type="primary" htmlType="submit">
              注册
            </Button>
            <Button
              type="link"
              onClick={() => navigate("/")}
              style={{ marginLeft: "10px" }}
            >
              返回登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
