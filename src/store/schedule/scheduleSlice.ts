import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ScheduleInstance } from "../../models/schedule";

interface ScheduleState {
  currentSchedule: ScheduleInstance | null;
}

const initialState: ScheduleState = {
  currentSchedule: null,
};

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    setSchedule: (state, action: PayloadAction<ScheduleInstance>) => {
      state.currentSchedule = action.payload;
    },

    updateAssignment: (
      state,
      action: PayloadAction<{
        assignmentId: string;
        shiftStart: string;
        shiftEnd: string;
      }>
    ) => {
      if (!state.currentSchedule?.assignments) return;

      const { assignmentId, shiftStart, shiftEnd } = action.payload;

      const target = state.currentSchedule.assignments.find(
        (a) => a.id === assignmentId
      );

      if (target) {
        target.shiftStart = shiftStart;
        target.shiftEnd = shiftEnd;
        target.isUpdated = true;
      }
    },
  },
});

export const { setSchedule, updateAssignment } = scheduleSlice.actions;
export default scheduleSlice.reducer;
