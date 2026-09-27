import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();


// ================= JWT SECRET =================

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured.");
    }

    return process.env.JWT_SECRET;
};


// ================= REGISTER =================

router.post("/register", async (req, res) => {

    try {

        const username =
            typeof req.body.username === "string"
                ? req.body.username.trim()
                : "";

        const email =
            typeof req.body.email === "string"
                ? req.body.email.trim().toLowerCase()
                : "";

        const password =
            typeof req.body.password === "string"
                ? req.body.password
                : "";


        // Required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                error: "Username, email and password are required."
            });
        }


        // Username validation
        if (username.length < 2 || username.length > 50) {
            return res.status(400).json({
                error: "Username must be between 2 and 50 characters."
            });
        }


        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: "Please enter a valid email address."
            });
        }


        // Password validation
        if (password.length < 8 || password.length > 128) {
            return res.status(400).json({
                error: "Password must be between 8 and 128 characters."
            });
        }


        // Check existing user
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                error: "Email already registered!"
            });
        }


        // Hash password
        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(
            password,
            salt
        );


        // Create user
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();


        res.status(201).json({
            message: "User registered successfully!"
        });


    } catch (err) {

        console.error("Register Error:", err);

        res.status(500).json({
            error: "Something went wrong while registering."
        });
    }
});


// ================= LOGIN =================

router.post("/login", async (req, res) => {

    try {

        const email =
            typeof req.body.email === "string"
                ? req.body.email.trim().toLowerCase()
                : "";

        const password =
            typeof req.body.password === "string"
                ? req.body.password
                : "";


        // Required fields
        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required."
            });
        }


        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password!"
            });
        }


        // Compare password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                error: "Invalid email or password!"
            });
        }


        // Get JWT secret
        const jwtSecret = getJwtSecret();


        // Create JWT
        const token = jwt.sign(
            {
                id: user._id
            },
            jwtSecret,
            {
                expiresIn: "1d"
            }
        );


        res.json({
            message: "Logged in successfully!",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });


    } catch (err) {

        console.error("Login Error:", err);

        res.status(500).json({
            error: "Something went wrong while logging in."
        });
    }
});


export default router;