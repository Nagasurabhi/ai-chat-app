import Message from "../models/Message.js";

// 📤 Send Message
export const sendMessage = async (req, res) => {
  try {
    console.log("REQ USER:", req.user);
    console.log("REQ BODY:", req.body);

    const senderId = req.user._id;
    const { receiverId, message } = req.body;

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// 📥 Get Chat History
export const getMessages = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};