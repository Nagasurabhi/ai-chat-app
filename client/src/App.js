import "./App.css";
import React, { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";

function App() {
  const [page, setPage] = useState("login");

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  if (userInfo) {
    return <Chat />;
  }

  return (
    <div className="auth-container">

      {/* 🔥 ONLY INSIDE CARD NOW */}
      {page === "login" 
        ? <Login setPage={setPage} /> 
        : <Register setPage={setPage} />}

    </div>
  );
}

export default App;