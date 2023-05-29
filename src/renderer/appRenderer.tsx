import React from "react";
import { render } from "react-dom";
import WindowFrame from "@misc/window/components/WindowFrame";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App";
import "./index.scss";

// Say something
console.log("[ERWT] : Renderer execution started");

// Application to Render
const app = (
  <WindowFrame title='ERWT Boilerplate' platform='mac'>
    <Provider store={store}>
      <App></App>
    </Provider>
  </WindowFrame>
);
const container = document.getElementById("app");
// Render application in DOM
render(app, container);
