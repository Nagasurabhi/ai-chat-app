import React, { useState } from "react";
import axios from "axios";

const Register = ({ setPage }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password
        }
      );

      localStorage.setItem("userInfo", JSON.stringify(data));
      window.location.reload();

      alert("Registration successful!");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Create Account 🚀</h2>

        <form onSubmit={submitHandler}>

          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

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

          <button type="submit">Register</button>

        </form>

        {/* ✅ INSIDE CARD */}
        <p className="auth-switch">
          Already have an account?{" "}
          <span 
            className="link-btn"
            onClick={() => setPage("login")}
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
};

export default Register;