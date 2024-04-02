import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import axios from "axios";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A569BD",
  "#5DADE2",
  "#F7DC6F",
  "#EB984E",
  // 可以根据需要添加更多颜色
];

const MyPieChart = ({ userId }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/learning_progress/get/${userId}`
        );
        const chartData = response.data.map((item) => ({
          name: item.PlanType,
          value: item.TotalTime,
        }));
        console.log(response.data);
        console.log("chartData", chartData);
        setData(chartData);
      } catch (error) {
        console.error("Error fetching learning progress:", error);
      }
    };

    fetchData();
  }, [userId]);

  return (
    <PieChart width={400} height={400}>
      <Pie
        data={data}
        cx={200}
        cy={200}
        labelLine={false}
        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
};

export default MyPieChart;
