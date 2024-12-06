import React, { useState } from "react";
import axios from "axios";

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:3350/api/auth/login",
        {
          email,
          password,
        }
      );

      // Assuming the response includes a token
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        onLogin(); // Inform App.js that login is successful
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
