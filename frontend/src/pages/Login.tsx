// 1. Importar 'React' para usar los tipos de eventos
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    navigate('/');
  };

  return (
    <div className="page-login">
      <div className="login-container">
        <h2>Iniciar sesión</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="user-box">
            <input
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
            <label>Correo Electrónico</label>
          </div>
          <div className="user-box">
            <input
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
            <label>Contraseña</label>
          </div>
          <div className="login-container-forgot">
            <a href="#">¿Olvidaste tu contraseña?</a>
          </div>
          <div className="login-container-btn">
            <button type="submit">Iniciar sesión</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;