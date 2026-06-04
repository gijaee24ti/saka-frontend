import { createRoot } from "react-dom/client";
// import Sidebar from "./layouts/Sidebar";
// import Header from "./layouts/Header";
// import Dashboard from "./pages/Dashboard";
import "./assets/tailwind.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

createRoot(document.getElementById("root")).render(

<BrowserRouter>
    <App />
</BrowserRouter>
);
