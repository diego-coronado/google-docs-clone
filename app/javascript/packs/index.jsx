import React from "react";
import { render } from "react-dom";
import App from "../App";
import ActionCableProvider from "../utils/action-cable";

document.addEventListener("DOMContentLoaded", () => {
  render(
    <React.StrictMode>
      <ActionCableProvider>
        <App />
      </ActionCableProvider>
    </React.StrictMode>,
    document.body.appendChild(document.createElement("div"))
  );
});
