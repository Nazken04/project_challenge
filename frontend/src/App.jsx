// App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import ProfilePage from "./components/ProfilePage";
import RegisterPage from "./components/RegisterPage"; // Import RegisterPage
import CardCreationPage from "./components/CardCreationPage"; // Import RegisterPage

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/profile" /> : <LoginPage />}
        />
        <Route
          path="/register" // New route for registration
          element={isLoggedIn ? <Navigate to="/profile" /> : <RegisterPage />}
        />
        <Route
          path="/profile"
          element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route path="/create-card" element={<CardCreationPage />} />
      </Routes>
    </Router>
  );
};

export default App;