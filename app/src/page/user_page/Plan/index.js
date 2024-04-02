import React, { useState, useEffect } from "react";
import {
  Calendar,
  List,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import "./index.css";

const { Option } = Select;
const Plan = () => {
  const [plans, setPlans] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [form] = Form.useForm();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    fetchPlans(userId);
  }, []);

  const fetchPlans = async (userId) => {
    try {
      const response = await axios.get("http://localhost:4000/api/plans/get", {
        headers: {
          "user-id": userId,
        },
      });
      setPlans(response.data);
    } catch (error) {
      console.error("获取计划列表失败:", error);
    }
  };

  const addPlan = async (planData) => {
    try {
      await axios.post("http://localhost:4000/api/plans/add", planData, {
        headers: {
          "user-id": userId,
        },
      });
      fetchPlans(userId);
      message.success("添加计划成功");
    } catch (error) {
      message.error("添加计划失败");
    }
  };

  const updatePlan = async (id, planData) => {
    try {
      await axios.put(
        `http://localhost:4000/api/plans/update/${id}`,
        planData,
        {
          headers: {
            "user-id": userId,
          },
        }
      );
      fetchPlans(userId);
      message.success("计划编辑成功");
    } catch (error) {
      message.error("计划编辑失败");
    }
  };

  const deletePlan = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/plans/del/${id}`, {
        headers: {
          "user-id": userId,
        },
      });
      fetchPlans(userId);
      message.success("删除计划成功");
    } catch (error) {
      message.error("删除计划失败");
    }
  };

  const showModal = (plan) => {
    setCurrentPlan(plan);
    setIsModalVisible(true);
    if (plan) {
      form.setFieldsValue({
        ...plan,
        StartDate: moment(plan.StartDate),
        EndDate: moment(plan.EndDate),
      });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setCurrentPlan(null);
  };

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

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const planData = {
        ...values,
        StartDate: values["StartDate"].format("YYYY-MM-DD"),
        EndDate: values["EndDate"].format("YYYY-MM-DD"),
        DailyStudyTime: values["DailyStudyTime"],
        Status: values["Status"],
        PlanType: values["PlanType"],
      };

      if (currentPlan) {
        updatePlan(currentPlan.PlanId, planData);
      } else {
        addPlan(planData);
      }
      setIsModalVisible(false);
      form.resetFields();
      setCurrentPlan(null);
    });
  };

  return (
    <div className="plan-container">
      <div className="plan-list">
        <Button icon={<PlusOutlined />} onClick={() => showModal(null)}>
          添加计划
        </Button>
        <List
          itemLayout="horizontal"
          dataSource={plans}
          renderItem={(item) => (
            <List.Item
              actions={[
                <EditOutlined key="edit" onClick={() => showModal(item)} />,
                <DeleteOutlined
                  key="delete"
                  onClick={() => deletePlan(item.PlanId)}
                />,
              ]}
            >
              <List.Item.Meta
                title={item.PlanDescription}
                description={`开始: ${moment(item.StartDate).format(
                  "YYYY-MM-DD"
                )}, 结束: ${moment(item.EndDate).format(
                  "YYYY-MM-DD"
                )}, 任务学习时间: ${
                  item.DailyStudyTime
                }小时, 状态: ${translateStatus(item.Status)}, 类型: ${
                  item.PlanType
                }`}
              />
            </List.Item>
          )}
        />
      </div>
      <div className="plan-calendar">
        <Calendar fullscreen={false} />
      </div>

      <Modal
        title={currentPlan ? "编辑计划" : "添加计划"}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText="提交"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="PlanDescription"
            label="任务名称"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="PlanType"
            label="计划类型"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="行测-常识">行测-常识</Option>
              <Option value="行测-资料分析">行测-资料分析</Option>
              <Option value="行测-数量关系">行测-数量关系</Option>
              <Option value="行测-判断推理">行测-判断推理</Option>
              <Option value="行测-言语理解与表达">行测-言语理解与表达</Option>
              <Option value="申论">申论</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="StartDate"
            label="开始时间"
            rules={[{ required: true }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="EndDate"
            label="结束时间"
            rules={[{ required: true }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="DailyStudyTime"
            label="学习时间（小时）"
            rules={[{ required: true, message: "请输入学习时间" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="Status"
            label="当前状态"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="Not Started">未开始</Option>
              <Option value="In Progress">进行中</Option>
              <Option value="Completed">完成</Option>
              <Option value="Paused">暂停</Option>
              <Option value="Cancelled">取消</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Plan;
