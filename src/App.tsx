import { Bubbles, Header, Loading, Prompt, Settings } from "@components";
import Okbar from "@components/Okbar/Okbar";
import { FileManager, Login, Main, Register, ToS, Welcome } from "@pages";
import { IPCGetKeyReply, IPCGetKeyRequest } from "@shared/models";
import { setAutoLoggedIn } from "@store/app";
import { login } from "@store/user";
import { ConnectedRouter } from "connected-react-router";
import { ipcRenderer } from "electron";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch } from "react-router";
import "./App.scss";
import { history } from "./configureStore";
import { RootState } from "./store";
import "./variables.scss";

// const mapDispatch = (dispatch: DefaultDispatch) => ({});

// const connector = connect(() => ({}), mapDispatch);

// type PropsFromState = ConnectedProps<typeof connector>;
// type Props = PropsFromState;

export function App(): JSX.Element {
  const state = useSelector(({ appReducer: { autoLoggedIn } }: RootState) => ({
    autoLoggedIn,
  }));
  const dispatch = useDispatch();
  useEffect(() => {
    async function autoLogin() {
      if (!state.autoLoggedIn) {
        const res: IPCGetKeyReply = await ipcRenderer.invoke("get-key", {
          caller: "app",
          key: "auto-login",
        } as IPCGetKeyRequest);
        if (res.result && new Boolean(res.val)) {
          const loginRes: IPCGetKeyReply = await ipcRenderer.invoke("get-key", {
            caller: "app",
            key: "username:masterpw",
          } as IPCGetKeyRequest);
          if (loginRes.result && Boolean(res.val)) {
            const [username, password] = loginRes.val.split(":");
            dispatch(login(username, password));
          }
        }
        dispatch(setAutoLoggedIn(true));
      }
    }

    autoLogin();
  }, [state.autoLoggedIn]);

  return (
    <div id="app">
      <Header></Header>
      <div id="app-wrapper">
        <ConnectedRouter history={history}>
          <Switch>
            <Route exact path="/" component={Welcome}></Route>
            <Route path="/login" component={Login}></Route>
            <Route path="/register" component={Register}></Route>
            <Route path="/main" component={Main}></Route>
            <Route path="/tos" component={ToS}></Route>
            <Route path="/file-manager" component={FileManager}></Route>
            <Route path="/settings" component={Settings}></Route>
          </Switch>
        </ConnectedRouter>
      </div>
      <Loading></Loading>
      <Prompt></Prompt>
      <Bubbles></Bubbles>
      <Okbar></Okbar>
    </div>
  );
}

export default App;
