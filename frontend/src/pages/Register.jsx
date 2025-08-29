import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Register.css';

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    navigate('/iniciar-sesion')
  };

  return (
    <div className="register-page">
    <div className="register-container">
      <h2>Registrarse</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="user-box">
          <input
            type="text"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            required
          />
          <label>Nombre</label>
        </div>
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
        <div className="register-container-btn">
          <button type="submit">Registrarse</button>
          <a href="/iniciar-sesion">¿Ya tenes una cuenta?</a>
        </div>
      </form>
    </div>
    </div>
  );
};

export default Register;