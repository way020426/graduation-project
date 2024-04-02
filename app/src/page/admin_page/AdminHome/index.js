import React from "react";
import { Layout, Menu } from "antd";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  FileTextOutlined,
  MessageOutlined,
  DatabaseOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { logout } from "../../../store/modules/loginStore";
import "./index.css";

const { Header, Content, Sider } = Layout;

const AdminHome = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("isLogin");
    navigate("/");
  };

  const items = [
    { label: "用户管理", key: "users", icon: <UserOutlined /> },
    { label: "资讯管理", key: "news", icon: <FileTextOutlined /> },
    { label: "反馈管理", key: "feedback", icon: <MessageOutlined /> },
    { label: "学习资料管理", key: "materials", icon: <DatabaseOutlined /> },
    { label: "模拟测试管理", key: "exam", icon: <DatabaseOutlined /> },
    {
      label: "退出登录",
      key: "logout",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  const handleMenuClick = (e) => {
    if (e.key === "logout") {
      handleLogout();
    } else {
      navigate(`/admin/home/${e.key}`);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header className="header">后台管理系统</Header>
      <Layout>
        <Sider width={200} className="site-layout-background">
          <Menu
            items={items}
            mode="inline"
            onClick={handleMenuClick}
            // 根据当前路由动态设置选中项
            selectedKeys={[location.pathname.split("/").pop()]}
            style={{ height: "100%", borderRight: 0 }}
          />
        </Sider>
        <Layout className="content-layout">
          <Content className="content-area">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminHome;
