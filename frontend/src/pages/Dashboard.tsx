import Header from "../layouts/Header/Header";
import Navbar from "../components/Navbar";
import { Container, Row, Col } from 'react-bootstrap';
import ResumenGeneral from './Dashboard/components/ResumenGeneral';
import VentasSemanalesChart from './Dashboard/components/VentasSemanalesChart'; 
import MetodosDePagoChart from './Dashboard/components/MetodosDePagoChart'; 
import GastosPorCategoriaChart from './Dashboard/GastosPorCategoriaChart';
import '../styles/Dashboard.css';

const Dashboard = () => {
    return (
        <>
            <Header />
            <div className="d-flex">
                <Navbar />
                <Container fluid as="main" className="flex-grow-1 p-4 dashboard-container">
                    <h1 className="dashboard-title">Dashboard de Contabilidad</h1>

                    {/* Fila 1: Resumen General (KPIs) */}
                    <ResumenGeneral />

                    {/* Fila 2: Gráficos de Ventas */}
                    <Row className="mb-4">
                        <Col lg={8} className="mb-3">
                            {/* 3. AÑADIR GRÁFICO SEMANAL */}
                            <VentasSemanalesChart />
                        </Col>
                        <Col lg={4} className="mb-3">
                            {/* 4. AÑADIR GRÁFICO MÉTODOS DE PAGO */}
                            <MetodosDePagoChart />
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col lg={4} className="mb-3">
                            <GastosPorCategoriaChart />
                        </Col>
                        {/* Puedes añadir más gráficos aquí (ej. lg={8}) */}
                    </Row>

                </Container>
            </div>
        </>
    );
};

export default Dashboard;