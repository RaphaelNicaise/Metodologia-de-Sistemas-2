import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Form,
  Button,
  FloatingLabel,
  Alert
} from 'react-bootstrap';
import "./Login.css";

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
    <Container
      fluid
      className="vh-100 d-flex align-items-center justify-content-center app-login-page"
    >
      <Card className="app-login-card shadow-lg">
        <Card.Body className="p-5">
          <Card.Title as="h2" className="text-center mb-4">
            Iniciar sesión
          </Card.Title>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            
            <FloatingLabel
              controlId="formEmail"
              label="Correo Electrónico"
              className="mb-3"
            >
              <Form.Control
                type="email"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
            </FloatingLabel>

            <FloatingLabel
              controlId="formPassword"
              label="Contraseña"
              className="mb-3"
            >
              <Form.Control
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
              />
            </FloatingLabel>

            <div className="text-end mb-3">
              <a href="#" className="login-link">¿Olvidaste tu contraseña?</a>
            </div>

            <div className="d-grid mt-4">
              <Button
                type="submit"
                variant="light" 
                size="lg"
                className="login-submit-btn"
              >
                Iniciar sesión
              </Button>
            </div>

          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;