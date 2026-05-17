import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import MessageBubble from "./MessageBubble";

const ChatWindow = ({ socket, receiverId }) => {
  const [messages, setMessages] = useState([]);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const hardcodedReceiverId = "69d0a0bd42caa032b63d5ee0";
  const activeReceiverId = receiverId || hardcodedReceiverId;

  const bottomRef = useRef(null);

  const [isTyping, setIsTyping] = useState({
    AI: false,
    user: false
  });

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/chat/${activeReceiverId}`,
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`
            }
          }
        );
        setMessages(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchMessages();
  }, [activeReceiverId, userInfo.token]);

  useEffect(() => {
    socket.on("receiveMessage", (newMsg) => {
      if (!newMsg || !newMsg.senderId) return;

      const isBetweenUsers =
        (newMsg.senderId === userInfo._id &&
          newMsg.receiverId === activeReceiverId) ||
        (newMsg.senderId === activeReceiverId &&
          newMsg.receiverId === userInfo._id);

      const isAIMessage = newMsg.senderId === "AI";

      if (isBetweenUsers || isAIMessage) {
        setMessages((prev) => {
          const filtered = prev.filter(
            (m) => m.message !== "Thinking..."
          );
          return [...filtered, newMsg];
        });
      }
    });

    return () => socket.off("receiveMessage");
  }, [socket, userInfo._id, activeReceiverId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.on("typing", (data) => {
      if (!data || !data.senderId) return;

      if (data.senderId === "AI") {
        setIsTyping((prev) => ({ ...prev, AI: true }));
      } else {
        setIsTyping((prev) => ({ ...prev, user: true }));
      }
    });

    socket.on("stopTyping", (data) => {
      if (!data || !data.senderId) return;

      if (data.senderId === "AI") {
        setIsTyping((prev) => ({ ...prev, AI: false }));
      } else {
        setIsTyping((prev) => ({ ...prev, user: false }));
      }
    });

    return () => {
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [socket]);

  useEffect(() => {
    setMessages([]);
  }, [activeReceiverId]);

  return (
  <div
    style={{
      position: "absolute",   // 🔥 breaks flex dependency
      top: "0",
      bottom: "60px",         // leave space for input
      left: "0",
      right: "0",
      overflowY: "auto",      // 🔥 THIS WILL WORK NOW
      padding: "10px",
      backgroundColor: "#ece5dd",
      borderRadius: "10px"
    }}
  >
    {messages.map((msg, index) => (
      <MessageBubble
        key={msg._id || index}
        message={msg}
        currentUser={userInfo._id}
      />
    ))}

    {isTyping.AI && <div>🤖 AI is thinking...</div>}
    {isTyping.user && <div>typing...</div>}

    <div ref={bottomRef} />
  </div>
);
};

export default ChatWindow;