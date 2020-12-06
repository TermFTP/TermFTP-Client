import { Header, Loading, Overlay } from "@components";
import { Login, Main, Register, Welcome } from "@pages";
import { DefaultDispatch } from "@store";
import { ConnectedRouter } from "connected-react-router";
import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { Route, Switch } from "react-router";
import "./App.scss";
import { history } from "./configureStore";
import "./variables.scss";

const mapDispatch = (dispatch: DefaultDispatch) => ({});

const connector = connect(() => ({}), mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

export function App(props: Props): JSX.Element {
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
          </Switch>
        </ConnectedRouter>
      </div>
      <Overlay></Overlay>
      <Loading></Loading>
    </div>
  );
}

export default App;
