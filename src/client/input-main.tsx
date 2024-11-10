import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Input } from "./input";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Input />
  </StrictMode>
);
