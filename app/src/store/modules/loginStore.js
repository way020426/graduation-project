import { createSlice } from "@reduxjs/toolkit";

// 初始状态
const initialState = {
  isLogin: localStorage.getItem("isLogin") === "true",
};

const loginStore = createSlice({
  name: "login",
  initialState,
  reducers: {
    login(state) {
      state.isLogin = true;
      localStorage.setItem("isLogin", "true");
    },
    logout(state) {
      state.isLogin = false;
      localStorage.setItem("isLogin", "false");
    },
  },
});

// 解构出来 actionCreater 函数
const { login, logout } = loginStore.actions;
// 拿到 reducer
const reducer = loginStore.reducer;
// 导出
export { login, logout };
export default reducer;
