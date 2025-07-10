import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { HashRouter as Router, useLocation } from "react-router-dom";
import { AuthProvider } from "./Auth/AuthContext";
import Navbar from "./components/Navbar";

const AppWrapper = () => {
  const location = useLocation();

  // Specify the routes where the navbar should not appear
  const hideNavbarRoutes = [ "/addtraining", "/edituser/:id"];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <App />
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
  <Router>
  {/* <Router basename="/pdrrmo/wp-content/reactpress/apps/pdrrmo-training"> */}
    <AuthProvider>
      <AppWrapper />
    </AuthProvider>
  </Router>
</React.StrictMode>
);

