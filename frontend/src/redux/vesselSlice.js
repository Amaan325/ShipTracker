// src/redux/vesselSlice.js
import { createSlice } from "@reduxjs/toolkit";

const savedVessel = JSON.parse(localStorage.getItem("currentVessel"));

const vesselSlice = createSlice({
  name: "vessel",
  initialState: { currentVessel: savedVessel || null },
  reducers: {
    setCurrentVessel: (state, action) => {
      state.currentVessel = action.payload;
      localStorage.setItem("currentVessel", JSON.stringify(action.payload));
    },
    clearCurrentVessel: (state) => {
      state.currentVessel = null;
      localStorage.removeItem("currentVessel");
    },
  },
});

export const { setCurrentVessel, clearCurrentVessel } = vesselSlice.actions;
export default vesselSlice.reducer;
