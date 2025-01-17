import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
dotenv.config()

  const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    return { accessToken, refreshToken };
  };

  const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
      httpOnly: true, //prevent XSS attacks, cross site scripting attacks
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", //prevents CRSF attacks, cross-site request forgery attacks
      maxAge: 15 * 60 * 1000, //15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });
  };

  export const signup = async (req, res) => {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      throw new Error("All fields are required");
    }

    try {
      const userExists = await User.findOne({ email });

      if (userExists) {
        return res.status(400).json({
          message: "User already exists",
        });
      }
      const user = await User.create({ email, password, name, role });

      // authenticate
      const { accessToken, refreshToken } = generateTokens(user._id);
      setCookies(res, accessToken, refreshToken);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      console.log("Error in logout controller", error.message);
      res.status(500).json({ message: error.message });
    }
  };


  export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (user && (await user.comparePassword(password))) {
        const { accessToken, refreshToken } = generateTokens(user._id);

        setCookies(res, accessToken, refreshToken);

        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        });
      } else {
        res.status(401).json({ message: "Invalid email or password" });
      }
    } catch (error) {
      console.log("Error in login controller", error.message);
      res.status(500).json({ message: error.message });
    }
  };

export const logout = async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
        const decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
      }

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };

//This will recreate an accessTOKEN
export const refreshToken = async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(401).json({ message: "No refresh token provided" });
      }

      const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);


      const accessToken = jwt.sign(
        { userId: decode.userId },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      res.json({ status: "Access token created" });
    } catch (error) {
      console.log("Error in refreshToken controller", error.message)
      res.status(500).json({ message: "Server Error", error: error.message})
    }
  };