import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./styles/index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error('Root element with id="root" was not found.');
}

createRoot(root).render(<App />);
