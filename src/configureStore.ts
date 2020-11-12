import { createBrowserHistory } from "history";
import { Store, createStore, applyMiddleware } from "redux";
import { RootState, createRootReducer } from "./store";
import thunk from "redux-thunk";
import { routerMiddleware } from "connected-react-router";

export const history = createBrowserHistory();

export default function configureStore(
  initialState: RootState
): Store<RootState> {
  const store = createStore(
    createRootReducer(history),
    initialState,
    applyMiddleware(routerMiddleware(history), thunk)
  );
  return store;
}
