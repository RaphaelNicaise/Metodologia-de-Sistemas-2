// frontend/src/pages/CierreCaja/CierreCaja.tsx
import Header from "../../layouts/Header/Header";
import Navbar from "../../components/Navbar";
import { Container, Row, Col, Card, Button, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { useCierreCaja } from "../../hooks/useCierreCaja";
import { FaCheckCircle, FaExclamationTriangle, FaCashRegister } from "react-icons/fa";
import './CierreCaja.css'; 

const CierreCaja = () => {
    const { preview, status, error, ejecutarCierre } = useCierreCaja();

    const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

    const renderContent = () => {
        if (status === "LOADING") {
            return (
                <div className="text-center p-5">
                    <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Cargando...</span>
                    </Spinner>
                    <p className="mt-3">Cargando vista previa del cierre...</p>
                </div>
            );
        }

        if (status === "ERROR") {
            return (
                <Alert variant="danger" className="d-flex align-items-center">
                    <FaExclamationTriangle className="me-3" style={{ fontSize: '2rem' }} />
                    <div>
                        <Alert.Heading>Error al cargar</Alert.Heading>
                        <p>{error}</p>
                    </div>
                </Alert>
            );
        }

        if (status === "CLOSED") {
            return (
                <Alert variant="success" className="text-center p-5">
                    <FaCheckCircle className="mb-3" style={{ fontSize: '4rem' }} />
                    <Alert.Heading>Cierre de Caja Realizado</Alert.Heading>
                    <p>El cierre para la fecha <strong>{preview?.closure_date}</strong> ya fue ejecutado.</p>
                    <hr />
                    <h5>Balance Final: {formatCurrency(preview?.final_balance ?? 0)}</h5>
                </Alert>
            );
        }

        if (status === "PREVIEW" && preview) {
            return (
                <>
                    {/* Fila 1: Resumen de Cajas */}
                    <Row className="mb-4">
                        <Col md={4}>
                            <Card className="summary-card text-success">
                                <Card.Body>
                                    <Card.Title>Total de Ventas</Card.Title>
                                    <Card.Text as="h3">{formatCurrency(preview.total_sales)}</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="summary-card text-danger">
                                <Card.Body>
                                    <Card.Title>Gastos de Caja</Card.Title>
                                    <Card.Text as="h3">{formatCurrency(preview.cash_expenses)}</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className={`summary-card ${preview.final_balance >= 0 ? 'text-info' : 'text-danger'}`}>
                                <Card.Body>
                                    <Card.Title>Balance de Caja Final</Card.Title>
                                    <Card.Text as="h3">{formatCurrency(preview.final_balance)}</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Fila 2: Desgloses */}
                    <Row className="mb-4">
                        <Col md={6}>
                            <Card>
                                <Card.Header as="h5">Desglose de Ventas</Card.Header>
                                <ListGroup variant="flush">
                                    {Object.entries(preview.sales_breakdown).map(([metodo, total]) => (
                                        <ListGroup.Item key={metodo} className="d-flex justify-content-between">
                                            <span>{metodo.charAt(0).toUpperCase() + metodo.slice(1)}:</span>
                                            <strong>{formatCurrency(total)}</strong>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card>
                                <Card.Header as="h5">Desglose de Gastos</Card.Header>
                                <ListGroup variant="flush">
                                    {Object.entries(preview.expenses_breakdown).map(([cat, total]) => (
                                        <ListGroup.Item key={cat} className="d-flex justify-content-between">
                                            <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}:</span>
                                            <strong>{formatCurrency(total)}</strong>
                                        </ListGroup.Item>
                                    ))}
                                    <ListGroup.Item variant="light" className="d-flex justify-content-between">
                                        <span>Otros Gastos (No Caja):</span>
                                        <strong>{formatCurrency(preview.other_expenses)}</strong>
                                    </ListGroup.Item>
                                </ListGroup>
                            </Card>
                        </Col>
                    </Row>

                    {/* Fila 3: Botón de Cierre */}
                    <div className="text-center p-4">
                        <Button
                            variant="success"
                            size="lg"
                            onClick={ejecutarCierre}
                            disabled={!preview.can_close}
                        >
                            <FaCashRegister className="me-2" />
                            Confirmar y Cerrar el Día
                        </Button>
                        {!preview.can_close && (
                            <Alert variant="warning" className="mt-3">
                                No se puede cerrar: {error || "El día ya fue cerrado."}
                            </Alert>
                        )}
                    </div>
                </>
            );
        }

        return null; // Estado inicial
    };

    return (
        <>
            <Header />
            <div className="d-flex">
                <Navbar />
                <Container fluid as="main" className="flex-grow-1 p-4 dashboard-container">
                    <h1 className="dashboard-title">Cierre de Caja Diario</h1>
                    <p className="lead">
                        Vista previa para el día: <strong>{preview?.closure_date || "Cargando..."}</strong>
                    </p>
                    <hr />
                    {renderContent()}
                </Container>
            </div>
        </>
    );
};

export default CierreCaja;