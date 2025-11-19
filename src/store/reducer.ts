import { combineReducers } from "redux";
import uiReducer from "./ui";
import authReducer from "./auth";
import scheduleReducer from "./schedule/scheduleSlice";

const rootReducer = combineReducers({
  ui: uiReducer,
  auth: authReducer,
  schedule: scheduleReducer,
});

export type RootStateInstance = ReturnType<typeof rootReducer>;

export default rootReducer;
