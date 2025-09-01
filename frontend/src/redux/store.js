import { configureStore } from "@reduxjs/toolkit";
import vesselReducer from "./vesselSlice";

export const store = configureStore({
  reducer: {
    vessel: vesselReducer,
  },
});

export default store;
