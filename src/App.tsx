import { Bubbles, Header, Loading, Prompt, Settings } from "@components";
import { Login, Main, Register, ToS, Welcome } from "@pages";
import { ConnectedRouter } from "connected-react-router";
import React from "react";
import { Route, Switch } from "react-router";
import "./App.scss";
import { history } from "./configureStore";
import "./variables.scss";

// const mapDispatch = (dispatch: DefaultDispatch) => ({});

// const connector = connect(() => ({}), mapDispatch);

// type PropsFromState = ConnectedProps<typeof connector>;
// type Props = PropsFromState;

export function App(): JSX.Element {
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
