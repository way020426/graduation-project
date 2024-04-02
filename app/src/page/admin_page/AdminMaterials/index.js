import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Upload,
  Modal,
  Form,
  Input,
  Select,
  message,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "./index.css";

// const { Option } = Select;

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/materials/get"
      );
      setMaterials(response.data);
    } catch (error) {
      message.error("加载学习资料失败");
    }
  };

  const deleteMaterial = async (materialId) => {
    try {
      await axios.delete(
        `http://localhost:4000/api/materials/del/${materialId}`
      );
      fetchMaterials();
      message.success("资料删除成功");
    } catch (error) {
      message.error("删除资料失败");
    }
  };

  const showEditModal = (material) => {
    setEditingMaterial(material);
    form.setFieldsValue(material);
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("file", values.file[0].originFileObj);
    formData.append("FileName", values.FileName);
    formData.append("MaterialType", values.MaterialType);
    formData.append("Category", values.Category);

    try {
      await axios.post("http://localhost:4000/api/materials/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      fetchMaterials();
      message.success("资料上传成功");
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("资料上传失败");
    }
  };

  const handleEditSubmit = async (values) => {
    const formData = new FormData();
    // 如果用户选择了新文件，则添加到表单数据中
    if (values.file && values.file.length > 0) {
      formData.append("file", values.file[0].originFileObj);
    }
    formData.append("FileName", values.FileName);
    formData.append("MaterialType", values.MaterialType);
    formData.append("Category", values.Category);

    // 标记是否有新文件被上传
    formData.append("hasFile", values.file && values.file.length > 0);

    try {
      await axios.put(
        `http://localhost:4000/api/materials/update/${editingMaterial.MaterialId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      fetchMaterials();
      message.success("资料更新成功");
      setIsModalVisible(false);
      form.resetFields();
      setEditingMaterial(null);
    } catch (error) {
      message.error("资料更新失败");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingMaterial(null);
  };

  const columns = [
    {
      title: "文件名",
      dataIndex: "FileName",
      key: "FileName",
    },
    {
      title: "文件类型",
      dataIndex: "MaterialType",
      key: "MaterialType",
    },
    {
      title: "课程类别",
      dataIndex: "Category",
      key: "Category",
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <>
          <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>
            编辑
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => deleteMaterial(record.MaterialId)}
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="materials-container">
      <Button icon={<UploadOutlined />} onClick={() => setIsModalVisible(true)}>
        上传资料
      </Button>
      <Table dataSource={materials} columns={columns} rowKey="MaterialId" />
      <Modal
        title={editingMaterial ? "编辑学习资料" : "上传学习资料"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          onFinish={editingMaterial ? handleEditSubmit : handleSubmit}
        >
          <Form.Item
            name="FileName"
            label="文件名"
            rules={[{ required: true, message: "请输入文件名" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="MaterialType"
            label="类型"
            rules={[{ required: true, message: "请选择文件类型" }]}
          >
            <Select>
              <Select.Option value="PDF">PDF</Select.Option>
              <Select.Option value="Video">视频</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="Category"
            label="类别"
            rules={[{ required: true, message: "请选择资料类别" }]}
          >
            <Select>
              <Select.Option value="行测">行测</Select.Option>
              <Select.Option value="申论">申论</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="file"
            label="文件"
            rules={[{ required: true, message: "请选择文件" }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e && e.fileList;
            }}
          >
            <Upload beforeUpload={() => false}>
              <Button>选择文件</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              上传
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Materials;
