import express from "express";
import { sendMessage, getMessages } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", protect, sendMessage);
router.get("/:receiverId", protect, getMessages);



// Send message
router.post("/send", sendMessage);

// Get chat history
router.get("/:senderId/:receiverId", getMessages);

export default router;