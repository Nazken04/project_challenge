import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";  // Import the useNavigate hook

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();  // Initialize useNavigate

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post("http://localhost:3350/api/auth/login", {
        email,
        password,
      });
  
      // Log the response to see the token
      console.log("Login Response:", response.data);
  
      // Check if the token is received from the backend
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);  // Store the token in localStorage
        navigate("/profile");  // Redirect to the profile page after successful login
      }
    } catch (err) {
      setError("Неверные данные для входа");
    }
  };
  

  return (
    <div>
      <h2>Вход в систему</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Войти</button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
};

export default LoginPage;
