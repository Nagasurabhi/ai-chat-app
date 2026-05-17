import ReactMarkdown from "react-markdown";
import React from "react";

const MessageBubble = ({ message, currentUser }) => {
  const isMe = message.senderId === currentUser;
  const isAI = message.senderId === "AI";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isMe ? "flex-end" : "flex-start",
        marginBottom: "8px"
      }}
    >
      <span
        style={{
          display: "inline-block", // 🔥 important
          maxWidth: "60%",
          padding: "10px 14px",
          borderRadius: "12px",
          fontSize: "14px",
          lineHeight: "1.4",

          background: isAI
            ? "#fff7ed"
            : isMe
            ? "linear-gradient(135deg, #4f46e5, #6366f1)"
            : "#ffffff",

          color: isMe ? "white" : "#111",

          border: isMe
            ? "none"
            : "1px solid #e5e7eb",

          wordWrap: "break-word"
        }}
      >
        {isAI ? "🤖 " : ""}

        {/* ✅ FIX: render markdown INSIDE */}
        <div>
          <ReactMarkdown>
            {message.message}
          </ReactMarkdown>
        </div>

      </span>
    </div>
  );
};

export default MessageBubble;