import Header from "../layouts/Header/Header";
import Navbar from "../components/Navbar";
import { Container } from 'react-bootstrap';
import ResumenGeneral from "./Dashboard/components/ResumenGeneral";
import '../styles/Dashboard.css'; 

const Dashboard = () => {
    return (
        <>
            <Header />
            <div className="d-flex"> {/* Usamos d-flex de Bootstrap */}
                <Navbar />
                <Container fluid as="main" className="flex-grow-1 p-4 dashboard-container">
                    <h1 className="dashboard-title">Dashboard de Contabilidad</h1>
                    <ResumenGeneral />
                    

                </Container>
            </div>
        </>
    );
};

export default Dashboard;