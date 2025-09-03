import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

// Updated authentication system with localStorage token management

// Lazy load main pages for better performance
const Home = React.lazy(() => import("./pages/Home"));
const Blog = React.lazy(() => import("./pages/Blog"));
const BlogDetail = React.lazy(() => import("./pages/BlogDetail"));
const Admin = React.lazy(() => import("./pages/Admin"));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/blog" element={<Blog/>}/>
          <Route path="/blog/:slug" element={<BlogDetail/>}/>
          <Route path="/blog/admin" element={<Admin/>}/>
          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
