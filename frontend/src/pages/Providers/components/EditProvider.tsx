import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Spinner
} from 'react-bootstrap';
import useUpdateProvider from "../../../hooks/useUpdateProvider";
import type { Provider, CreateProviderData } from "../../../types/provider";
import './EditProvider.css';

interface Props {
  provider: Provider;
  onClose: () => void;
}

interface FormDataState {
  name: string;
  contact_email: string;
  phone_number: string;
  address: string;
  description: string;
}

const EditProvider = ({ provider, onClose }: Props) => {
  const { updateProvider, loading: updating, error: updateError } = useUpdateProvider();

  const [formData, setFormData] = useState<FormDataState>({
    name: provider.name,
    contact_email: provider.contact_email,
    phone_number: provider.phone_number,
    address: provider.address,
    description: provider.description
  });

  useEffect(() => {
    setFormData({
      name: provider.name,
      contact_email: provider.contact_email,
      phone_number: provider.phone_number,
      address: provider.address,
      description: provider.description
    });
  }, [provider]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as keyof FormDataState]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const providerDataToSubmit: Partial<CreateProviderData> = {
        name: formData.name,
        contact_email: formData.contact_email,
        phone_number: formData.phone_number,
        address: formData.address,
        description: formData.description
      };
      
      await updateProvider(provider.id, providerDataToSubmit);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error al actualizar proveedor:', error);
    }
  };

  return (
    <Modal
      show={true}
      onHide={onClose}
      size="lg"
      centered
      backdrop="static"
      keyboard={false}
      className="edit-provider-modal"
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton={!updating}>
          <Modal.Title as="h2">Editar Proveedor</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {updateError && (
            <Alert variant="danger">
              Error al actualizar proveedor: {updateError}
            </Alert>
          )}

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3" controlId="formProviderName">
                <Form.Label>
                  Nombre del Proveedor <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Ej: Distribuidora XYZ"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={updating}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formProviderEmail">
                <Form.Label>
                  Email de Contacto <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  name="contact_email"
                  placeholder="Ej: contacto@proveedor.com"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  required
                  disabled={updating}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formProviderPhone">
                <Form.Label>
                  Teléfono <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phone_number"
                  placeholder="Ej: 123456789"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  required
                  disabled={updating}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formProviderAddress">
                <Form.Label>
                  Dirección <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  placeholder="Ej: Calle 123, Ciudad"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  disabled={updating}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formProviderDescription">
                <Form.Label>
                  Descripción <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  placeholder="Ej: Proveedor de productos alimenticios"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  disabled={updating}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={updating}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={updating}
          >
            {updating ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Actualizando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditProvider;
