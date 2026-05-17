import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Signup
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // ✅ normalize email
    const normalizedEmail = email.toLowerCase();

    // ✅ check existing email
    const emailExists = await User.findOne({ email: normalizedEmail });
    if (emailExists) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    // ✅ check existing username
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({
        message: "Username already exists"
      });
    }

    // 🔥 HASH PASSWORD (CRITICAL FIX)
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ create user
    const user = await User.create({
      username,
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d"
      })
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Registration failed" });
  }
};

// Login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // ✅ normalize email
    const user = await User.findOne({ email: email.toLowerCase() });

    // ✅ compare hashed password
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d"
      });

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};