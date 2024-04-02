// User.js (前端组件)
import React, { useEffect, useState } from "react";
import { Table, message, Button } from "antd";
import axios from "axios";
import "./index.css";

const User = () => {
  // 设置用户数据的状态
  const [users, setUsers] = useState([]);

  // 获取用户数据
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/users/getusers"
        );
        setUsers(response.data);
        // console.log("用户数据:", response.data);
      } catch (error) {
        message.error("无法加载用户数据");
      }
    };
    fetchUsers();
  }, []);

  // 删除用户
  const deleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/users/deluser/${id}`);
      message.success("用户删除成功");
      setUsers(users.filter((user) => user.Userid !== id));
    } catch (error) {
      message.error("删除用户失败");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "Userid", key: "Userid" },
    { title: "用户名", dataIndex: "Username", key: "Username" },
    { title: "手机号", dataIndex: "Phone", key: "Phone" },
    { title: "注册时间", dataIndex: "RegisterTime", key: "RegisterTime" },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Button danger onClick={() => deleteUser(record.Userid)}>
          删除
        </Button>
      ),
    },
  ];

  return (
    <div className="user-container">
      <h1>用户管理</h1>
      <Table dataSource={users} columns={columns} rowKey="Userid" />
    </div>
  );
};

export default User;
