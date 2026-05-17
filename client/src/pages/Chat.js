import React, { useEffect, useState } from "react";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

const Chat = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    socket.emit("join", userInfo._id);
  }, [userInfo._id]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/users");

        const filteredUsers = res.data.filter(
          (u) => u._id !== userInfo._id
        );

        setUsers(filteredUsers);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUsers();
  }, [userInfo._id]);

  return (
    <div className="chat-container">

      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-header">
          {userInfo.username}
        </div>

        {users.map((u) => (
          <div
            key={u._id}
            onClick={() => setSelectedUser(u._id)}
            className={`user ${selectedUser === u._id ? "active" : ""}`}
          >
            {u.username}
          </div>
        ))}
      </div>

      {/* CHAT AREA */}
      <div className="chat-area" style={{
  flex: 1,
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  overflow: "hidden"   // 🔥 IMPORTANT
}}>

        {/* HEADER */}
        <div className="chat-header">
          <small>Logged in as {userInfo.username}</small>
          <div>
            {selectedUser
              ? users.find(u => u._id === selectedUser)?.username
              : "Select a user"}
          </div>
        </div>

        {/* 🔥 FIXED CHAT BODY */}
        <div
          style={{
            flex: 1,
            position:"relative"
          }}
        >
          {selectedUser ? (
            <>
              <ChatWindow socket={socket} receiverId={selectedUser} />
              <MessageInput socket={socket} receiverId={selectedUser} />
            </>
          ) : (
            <div style={{ padding: "20px" }}>
              Select a user to start chatting
            </div>
          )}
        </div>

        {/* LOGOUT */}
        <button
          onClick={() => {
            localStorage.removeItem("userInfo");
            window.location.reload();
          }}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "#ef4444",
            color: "white",
            border: "none",
            padding: "8px",
            borderRadius: "5px"
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Chat;