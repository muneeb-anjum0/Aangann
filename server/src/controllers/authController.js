// Auth controller
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const login = async (req,res)=>{
  const { email, password } = req.body;
  const user = await User.getUserByEmail(email?.toLowerCase());
  if(!user) return res.status(400).json({message:"Invalid credentials"});
  const ok = await bcrypt.compare(password, user.passwordHash);
  if(!ok) return res.status(400).json({message:"Invalid credentials"});

  // 15 minutes in seconds and ms
  const expiresInSec = 15 * 60;
  const expiresInMs = expiresInSec * 1000;
  const token = jwt.sign({ id:user.id, role:user.role, email:user.email }, process.env.JWT_SECRET, { expiresIn: expiresInSec });
  // Set cookie options for best compatibility
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd ? true : false,
    maxAge: expiresInMs
  });
  res.json({ id:user.id, email:user.email, role:user.role });
};

export const me = async (req,res)=>{ res.json({ id:req.user.id, email:req.user.email, role:req.user.role }); };
export const logout = (req,res)=>{ res.clearCookie("token"); res.json({ok:true}); };
