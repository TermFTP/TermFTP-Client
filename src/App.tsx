import { Bubbles, Header, Loading, Prompt, Settings } from "@components";
import { FileManager, Login, Main, Register, ToS, Welcome } from "@pages";
import { IPCEncryptReply } from "@shared/models";
import { login, register } from "@store/user";
import { ConnectedRouter } from "connected-react-router";
import { ipcRenderer } from "electron";
import React from "react";
import { useDispatch } from "react-redux";
import { Route, Switch } from "react-router";
import "./App.scss";
import { history } from "./configureStore";
import "./variables.scss";

// const mapDispatch = (dispatch: DefaultDispatch) => ({});

// const connector = connect(() => ({}), mapDispatch);

// type PropsFromState = ConnectedProps<typeof connector>;
// type Props = PropsFromState;

export function App(): JSX.Element {
  const dispatch = useDispatch();
  ipcRenderer.removeAllListeners("register-encrypt-reply");
  ipcRenderer.on("register-encrypt-reply", (event, args: IPCEncryptReply) => {
    const [master, , username, email] = args;
    dispatch(register(email, username, master));
  });
  ipcRenderer.removeAllListeners("login-encrypt-reply");
  ipcRenderer.on("login-encrypt-reply", (event, args: IPCEncryptReply) => {
    const [master, , username] = args;
    // TODO save key
    dispatch(login(username, master));
  });

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
          </Switch>
        </ConnectedRouter>
      </div>
      <Settings></Settings>
      <Loading></Loading>
      <Prompt></Prompt>
      <Bubbles></Bubbles>
    </div>
  );
}

export default App;
