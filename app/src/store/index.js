import { configureStore } from "@reduxjs/toolkit";

// 导入子模块 reducer
import loginReducer from "./modules/loginStore";
const store = configureStore({
  reducer: {
    login: loginReducer,
  },
});

export default store;
