import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isLogin = useSelector((state) => state.login.isLogin);

  if (!isLogin) {
    // 如果用户未登录，则重定向到登录页面
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
