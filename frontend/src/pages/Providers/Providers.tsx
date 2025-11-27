import { useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import Navbar from "../../components/Navbar";
import Header from "../../layouts/Header/Header";
import ProvidersTable from "./components/ProvidersTable";
import CreateProvider from "./components/CreateProvider";
import './Providers.css';

const Providers: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleOpenCreateModal = () => setShowCreateModal(true);
  const handleCloseCreateModal = () => setShowCreateModal(false);

  return (
    <>
      <Header />

      <div className="d-flex main-layout-rb">
        <Navbar />

        <Container fluid as="main" className="flex-grow-1 p-4 providers-container">
          <h1 className="page-title mb-4">Proveedores</h1>

          <Row className="mb-3 align-items-center">
            <Col className="d-flex justify-content-end">
              <Button
                variant="primary"
                onClick={handleOpenCreateModal}
                className="create-btn"
              >
                + Nuevo Proveedor
              </Button>
            </Col>
          </Row>

          <Row>
            <Col>
              <ProvidersTable />
            </Col>
          </Row>
        </Container>

        {showCreateModal && (
          <CreateProvider onClose={handleCloseCreateModal} />
        )}
      </div>
    </>
  );
};

export default Providers;
