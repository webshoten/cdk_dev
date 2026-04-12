import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@aws-amplify/ui-react/styles.css";
import { App } from "./app/App";

// biome-ignore lint/style/noNonNullAssertion: root 要素は index.html で必ず存在する
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
