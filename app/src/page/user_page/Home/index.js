import React from "react";
import { Layout, Menu, message } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../../store/modules/loginStore";
import {
  BookOutlined,
  UserOutlined,
  ReadOutlined,
  ExclamationCircleOutlined,
  ProfileOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import "./index.css";

const { Header } = Layout;

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation(); // 获取当前页面的路径
  const handleLogout = () => {
    // 触发 logout action
    dispatch(logout());
    // 显示退出消息
    message.success("已成功退出");
    localStorage.removeItem("userId");
    // 重定向到登录页面
    navigate("/");
  };
  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      handleLogout();
    } else {
      navigate(`/user/home/${key}`);
    }
  };

  const items = [
    { label: "首页", key: "main", icon: <FilePdfOutlined /> },
    { label: "最新咨询", key: "news", icon: <InfoCircleOutlined /> },
    { label: "课程学习", key: "courses", icon: <BookOutlined /> },
    { label: "模拟测试", key: "exams", icon: <ExclamationCircleOutlined /> },
    { label: "错题集", key: "mistakes", icon: <ProfileOutlined /> },
    { label: "学习计划", key: "plan", icon: <ReadOutlined /> },
    { label: "个人中心", key: "profile", icon: <UserOutlined /> },
    {
      label: "退出登录",
      key: "logout",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];
  const selectedKey = location.pathname.split("/").pop() || "main";

  return (
    <Layout className="site-layout">
      <Header>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={items}
          onClick={handleMenuClick}
        />
      </Header>
      <Outlet />
    </Layout>
  );
};

export default Home;
