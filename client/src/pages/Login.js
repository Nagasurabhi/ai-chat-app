import React, { useState } from "react";
import axios from "axios";

const Login = ({ setPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: email.trim().toLowerCase(),
          password
        }
      );

      localStorage.setItem("userInfo", JSON.stringify(data));
      window.location.reload();

    } catch (error) {
      alert(error.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Welcome Back 👋</h2>

        <form onSubmit={submitHandler}>

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Login</button>

        </form>

        {/* ✅ INSIDE CARD */}
        <p className="auth-switch">
          Don’t have an account?{" "}
          <span 
            className="link-btn"
            onClick={() => setPage("register")}
          >
            Register
          </span>
        </p>

      </div>
    </div>
  );
};

export default Login;