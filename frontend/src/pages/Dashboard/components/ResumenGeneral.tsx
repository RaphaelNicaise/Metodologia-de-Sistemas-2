import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { FaArrowUp, FaArrowDown, FaExclamationTriangle } from 'react-icons/fa';
import { useDashboardStats } from '../../../hooks/useDashboardStats';
import './ResumenGeneral.css';

// Componente pequeño para mostrar mientras cargan los datos
const SummaryCardSkeleton = () => (
    <Col md={6} lg={3} className="mb-3">
        <Card className="summary-card shadow-sm">
            <Card.Body>
                <Card.Title as="h6" className="text-muted placeholder-glow">
                    <span className="placeholder col-6"></span>
                </Card.Title>
                <Card.Text as="h4" className="fw-bold placeholder-glow">
                    <span className="placeholder col-8"></span>
                </Card.Text>
            </Card.Body>
        </Card>
    </Col>
);

const ResumenGeneral = () => {
    // 1. Usamos nuestro hook para obtener los datos
    const { data, loading, error } = useDashboardStats();

    // --- Estado de Carga ---
    if (loading) {
        return (
            <Row className="mb-4">
                <h2 className="h5 mb-3">Resumen General</h2>
                <SummaryCardSkeleton />
                <SummaryCardSkeleton />
                <SummaryCardSkeleton />
                <SummaryCardSkeleton />
            </Row>
        );
    }

    // --- Estado de Error ---
    if (error) {
        return (
            <Alert variant="danger" className="d-flex align-items-center">
                <FaExclamationTriangle className="me-2" />
                <div>
                    <strong>Error al cargar resumen:</strong> {error}
                </div>
            </Alert>
        );
    }

    // --- Estado Exitoso (Datos listos) ---

    // 2. Extraemos los datos de la API
    const daily = data.dailyReport;
    const monthly = data.monthlyComparison;

    const ventasHoy = daily?.sales.total_amount ?? 0;
    const gastosHoy = daily?.expenses.cash_expenses ?? 0; // Solo gastos de caja
    const balanceCaja = daily?.cash_balance ?? 0;

    const ingresosMesActual = monthly?.current.data.total_revenue ?? 0;
    const ingresosMesAnterior = monthly?.previous.data.total_revenue ?? 0;

    let crecimientoMensual = 0;
    if (ingresosMesAnterior > 0) {
        crecimientoMensual = ((ingresosMesActual - ingresosMesAnterior) / ingresosMesAnterior) * 100;
    } else if (ingresosMesActual > 0) {
        crecimientoMensual = 100; // Si el mes pasado fue 0, pero este no, es 100% (o "infinito")
    }

    const isGrowthPositive = crecimientoMensual >= 0;

    // 3. Renderizamos las tarjetas con los datos reales
    return (
        <Row className="mb-4">
            <h2 className="h5 mb-3">Resumen General</h2>

            <Col md={6} lg={3} className="mb-3">
                <Card className="summary-card shadow-sm">
                    <Card.Body>
                        <Card.Title as="h6" className="text-muted">Ventas Totales Hoy</Card.Title>
                        <Card.Text as="h4" className="fw-bold">
                            ${ventasHoy.toFixed(2)}
                        </Card.Text>
                    </Card.Body>
                </Card>
            </Col>

            <Col md={6} lg={3} className="mb-3">
                <Card className="summary-card shadow-sm">
                    <Card.Body>
                        <Card.Title as="h6" className="text-muted">Gastos de Caja Hoy</Card.Title>
                        <Card.Text as="h4" className="fw-bold">
                            ${gastosHoy.toFixed(2)}
                        </Card.Text>
                    </Card.Body>
                </Card>
            </Col>

            <Col md={6} lg={3} className="mb-3">
                <Card className="summary-card shadow-sm">
                    <Card.Body>
                        <Card.Title as="h6" className="text-muted">Balance de Caja</Card.Title>
                        <Card.Text as="h4" className={`fw-bold ${balanceCaja >= 0 ? 'text-success' : 'text-danger'}`}>
                            ${balanceCaja.toFixed(2)}
                        </Card.Text>
                    </Card.Body>
                </Card>
            </Col>

            <Col md={6} lg={3} className="mb-3">
                <Card className="summary-card shadow-sm">
                    <Card.Body>
                        <Card.Title as="h6" className="text-muted">Crecimiento Mensual</Card.Title>
                        <Card.Text as="h4" className={`fw-bold ${isGrowthPositive ? 'text-success' : 'text-danger'}`}>
                            {isGrowthPositive ? <FaArrowUp /> : <FaArrowDown />} {crecimientoMensual.toFixed(1)}%
                        </Card.Text>
                        <small className="text-muted">Mes anterior: ${ingresosMesAnterior.toFixed(2)}</small>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default ResumenGeneral;