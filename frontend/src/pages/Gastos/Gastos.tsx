// frontend/src/pages/Gastos/components/Gastos.tsx
import { useState } from "react";
import Header from "../../layouts/Header/Header";
import Navbar from "../../components/Navbar";
import { Container, Row, Col, Button, Alert } from "react-bootstrap";
import { FaPlus } from "react-icons/fa6";
import CreateGasto from "./components/CreateGasto"; // El modal que crearemos

const Gastos = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    // Por ahora, solo mostramos un botón
    // En el futuro, aquí podrías añadir una tabla con la lista de gastos

    return (
        <>
            <Header />
            <div className="d-flex main-layout-rb">
                <Navbar />
                <Container fluid as="main" className="flex-grow-1 p-4 product-container-rb">
                    <h1 className="product-page-title">Gestión de Gastos</h1>

                    <Row className="mb-3 align-items-center">
                        <Col md={6} lg={8} className="d-flex justify-content-end">
                            <Button
                                variant="success"
                                onClick={() => setIsOpen(true)}
                                className="d-flex align-items-center gap-2"
                            >
                                <FaPlus />
                                <span>Cargar Gasto</span>
                            </Button>
                        </Col>
                    </Row>

                    <Alert variant="info">
                        Aquí se mostrará la tabla de gastos... (Próximamente)
                    </Alert>

                </Container>

                {isOpen && (
                    <CreateGasto onClose={() => setIsOpen(false)} />
                )}
            </div>
        </>
    );
};

export default Gastos;