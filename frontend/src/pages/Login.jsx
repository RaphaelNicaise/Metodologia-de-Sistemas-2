import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
  };

  return (
    <div className="login-container">
      <h2>Iniciar sesión</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="user-box">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>Correo Electrónico</label>
        </div>
        <div className="user-box">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label>Contraseña</label>
        </div>
        <div className="login-container-forgot">
          <a href="#">¿Olvidaste tu contraseña?</a>
        </div>
        <div className="login-container-btn">
          <button type="submit">Iniciar sesión</button>
          <a href="/registrarse">¿Todavía no tenés una cuenta?</a>
        </div>
      </form>
    </div>
  );
};

export default Login;
