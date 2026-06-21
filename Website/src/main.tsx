import React from "react";
import ReactDOM from "react-dom/client";
import "reactflow/dist/style.css";
import { App } from "./app/App";
import "./styles/global.css";
import { ThemeProvider } from "./components/common/ThemeProvider";
import { ErrorBoundary } from "./components/common/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><ErrorBoundary><ThemeProvider><App /></ThemeProvider></ErrorBoundary></React.StrictMode>,
);
