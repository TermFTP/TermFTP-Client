import { Bubbles, Header, Loading, Prompt, Settings } from "@components";
import { SSH } from "@lib";
import { FileManager, Login, Main, Register, ToS, Welcome } from "@pages";
import { IPCGetKeyReply, IPCGetKeyRequest } from "@shared/models";
import { setAutoLoggedIn } from "@store/app";
import { login } from "@store/user";
import { ConnectedRouter } from "connected-react-router";
import { ipcRenderer } from "electron";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch } from "react-router";
import XTerm, { Terminal } from "@termftp/react-xterm";
import "./App.scss";
import { history } from "./configureStore";
import { RootState } from "./store";
import "./variables.scss";
import "../node_modules/xterm/dist/xterm.css";

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

  const inputRef: React.RefObject<XTerm> = React.createRef();

  useEffect(() => {

    //TEST SSH
    const term = inputRef.current.getTerminal();
    term.writeln("adlskjfölasjflkjasdklfjöasdf");
    term.open(document.getElementById('terminalContainer'));
    term.resize(50,50);
    const ssh: SSH = new SSH();
    ssh.connect({host: "test.rebex.net", port: 22, username: "demo", password: "password"}, term);

  }, []);

  return (
    <XTerm ref={inputRef}
          addons={['fit', 'fullscreen', 'search']}
          style={{
            overflow: 'hidden',
            position: 'relative',
            width: '100%',
            height: '100%'
          }}/>
    /*
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

      </div>{*/
  );
}

export default App;
