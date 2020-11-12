import { Header, Loading, Overlay } from "@components";
// import { Register } from "@pages";
import { DefaultDispatch } from "@store";
import { ConnectedRouter, push } from "connected-react-router";
import React, { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Route, Switch } from "react-router";
import "./App.scss";
import { history } from "./configureStore";

const mapDispatch = (dispatch: DefaultDispatch) => {
  return {};
};

const connector = connect(() => ({}), mapDispatch);

type PropsFromState = ConnectedProps<typeof connector>;
type Props = PropsFromState;

export function App(): JSX.Element {
  useEffect(() => {
    push("/register");
  });
  return (
    <div className="App">
      <Header></Header>

      <div id="app-wrapper">
        <ConnectedRouter history={history}>
          <Switch>
            {/* <Route exact path="/" component={Main}></Route> */}
            {/* <Route path="/login" component={Welcome}></Route> */}
            {/* <Route path="/" component={Register}></Route> */}
          </Switch>
        </ConnectedRouter>
      </div>
      <Overlay></Overlay>
      <Loading></Loading>
    </div>
  );
}

export default App;
