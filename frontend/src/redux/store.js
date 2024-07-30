import { configureStore } from "@reduxjs/toolkit";
import infoReducer from "./slice/infoSlice";



export const store = configureStore({
  reducer: {
    user: infoReducer,
  },
});
