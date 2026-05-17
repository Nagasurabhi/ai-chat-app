import React, { useState, useRef } from "react";
import axios from "axios";

const MessageInput = ({ socket, receiverId }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const typingRef = useRef(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const sendMessage = async () => {
    if (!message.trim()) return;

    if (!receiverId) {
      alert("Select a user first");
      return;
    }

    // 🛑 stop typing when sending
    socket.emit("stopTyping", {
      senderId: userInfo._id,
      receiverId
    });

    clearTimeout(typingRef.current);

    // 🤖 AI FLOW
    if (message.startsWith("@ai")) {

      if (loading) return;
      setLoading(true);

      try {
        socket.emit("sendMessage", {
          senderId: userInfo._id,
          receiverId,
          message
        });

        socket.emit("typing", {
          senderId: "AI",
          receiverId
        });

        socket.emit("sendMessage", {
          senderId: "AI",
          receiverId,
          message: "Thinking..."
        });

        // 🔥 FIX: removed AbortController timeout (was killing request early)
        console.log("🔥 Sending AI request:", message);
        const res = await axios.post(
          "http://localhost:5000/api/ai/chat",
          { message }
        );

        socket.emit("stopTyping", {
          senderId: "AI",
          receiverId
        });

        socket.emit("sendMessage", {
          senderId: "AI",
          receiverId,
          message: res.data.reply
        });

      } catch (error) {
        console.log("FINAL FAIL:", error);

        socket.emit("stopTyping", {
          senderId: "AI",
          receiverId
        });

        // 🔥 FIX: use backend response instead of hardcoded message
        socket.emit("sendMessage", {
          senderId: "AI",
          receiverId,
          message: error?.response?.data?.reply || "⚠️ AI failed."
        });
      }

      setLoading(false);
      setMessage("");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/chat/send",
        {
          receiverId,
          message
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`
          }
        }
      );

      socket.emit("sendMessage", {
        senderId: userInfo._id,
        receiverId,
        message
      });

      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
  style={{
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    padding: "10px",
    background: "#f0f0f0",
    borderTop: "1px solid #ddd"
  }}
>
      <input
        value={message}
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
        onChange={(e) => {
          setMessage(e.target.value);

          socket.emit("typing", {
            senderId: userInfo._id,
            receiverId
          });

          clearTimeout(typingRef.current);

          typingRef.current = setTimeout(() => {
            socket.emit("stopTyping", {
              senderId: userInfo._id,
              receiverId
            });
          }, 1000);
        }}
        placeholder="Type message..."
        style={{
          flex: 1,
          padding: "10px 15px",
          borderRadius: "20px",
          border: "1px solid #ccc",
          outline: "none",
          fontSize: "14px"
        }}
      />

      <button
        onClick={sendMessage}
        className="send-btn"
      >
        ➤
      </button>
    </div>
  );
};

export default MessageInput;