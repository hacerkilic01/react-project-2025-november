/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Task } from "redux-saga";
import type { Store } from "redux";

import createSagaMiddleware from "redux-saga";
import { createBrowserHistory } from "history";
import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "@redux-devtools/extension";
import { createReduxHistoryContext } from "redux-first-history";

import rootSaga from "./rootSaga";
import rootReducer from "./reducer";

const bindMiddleware = (middleware: any[]) => {
  return composeWithDevTools(applyMiddleware(...middleware));
};

interface StoreInstance extends Store {
  sagaTask: Task;
}

// History setup
const history = createBrowserHistory();

const { createReduxHistory, routerMiddleware } = createReduxHistoryContext({
  history,
  reduxTravelling: false,
  savePreviousLocations: 1,
});

// Main store creation
const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  rootReducer,
  bindMiddleware([sagaMiddleware, routerMiddleware])
) as StoreInstance;

store.sagaTask = sagaMiddleware.run(rootSaga);

export const historyInstance = createReduxHistory(store);
export type AppDispatch = typeof store.dispatch;

export default store;
