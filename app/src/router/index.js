import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

// 导入用户页面组件
import Home from "../page/user_page/Home";
import Login from "../page/Login";
import Register from "../page/Register";
import Courses from "../page/user_page/Courses";
import Exams from "../page/user_page/Exams";
import Mistakes from "../page/user_page/Mistakes";
import Plan from "../page/user_page/Plan";
import News from "../page/user_page/News";
import Feedback from "../page/user_page/Feedback";
import Profile from "../page/user_page/Profile";
import Main from "../page/user_page/Main";
import ExamPage from "../page/user_page/ExamPage";

// 导入管理员页面组件
import AdminHome from "../page/admin_page/AdminHome";
import AdminNews from "../page/admin_page/AdminNews";
import AdminFeedback from "../page/admin_page/AdminFeedback";
import AdminExam from "../page/admin_page/AdminExam";
import AdminMaterials from "../page/admin_page/AdminMaterials";
import Users from "../page/admin_page/Users";

const router = createBrowserRouter([
  // 登录注册路由
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "register",
    element: <Register />,
  },
  // 考试页面路由
  {
    path: "exam/:examId",
    element: <ExamPage />,
  },
  // 用户页面路由
  {
    path: "user",
    children: [
      {
        path: "home",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "main",
            element: <Main />,
          },
          {
            path: "courses",
            element: <Courses />,
          },
          {
            path: "exams",
            element: <Exams />,
          },

          {
            path: "mistakes",
            element: <Mistakes />,
          },
          {
            path: "plan",
            element: <Plan />,
          },
          {
            path: "news",
            element: <News />,
          },
          {
            path: "feedback",
            element: <Feedback />,
          },
          {
            path: "profile",
            element: <Profile />,
          },
        ],
      },
    ],
  },
  // 管理员页面路由
  {
    path: "admin",
    children: [
      {
        path: "home",
        element: (
          <ProtectedRoute>
            <AdminHome />
          </ProtectedRoute>
        ),

        children: [
          {
            path: "users",
            element: <Users />,
          },
          {
            path: "news",
            element: <AdminNews />,
          },
          {
            path: "feedback",
            element: <AdminFeedback />,
          },
          {
            path: "exam",
            element: <AdminExam />,
          },
          {
            path: "materials",
            element: <AdminMaterials />,
          },
        ],
      },
    ],
  },
]);

export default router;
