import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.scss";
import "cesium/Build/Cesium/Widgets/widgets.css";

window.CESIUM_BASE_URL = "../node_modules/cesium/Build/Cesium";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
