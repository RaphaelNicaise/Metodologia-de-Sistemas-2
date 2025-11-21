import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaMoneyBillWave, FaCreditCard, FaQrcode, FaCheckCircle } from 'react-icons/fa';
import type { PaymentMethod } from '../../../types/Sale';

interface Props {
  show: boolean;
  total: number;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (method: PaymentMethod) => void;
}

const PaymentModal = ({ show, total, loading, error, onClose, onConfirm }: Props) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [amountPaid, setAmountPaid] = useState<string>('');

  useEffect(() => {
    setAmountPaid('');
  }, [show, paymentMethod]);

  const handleConfirm = () => {
    if (paymentMethod === 'efectivo' && amountPaid && parseFloat(amountPaid) < total) {
      return; 
    }
    onConfirm(paymentMethod);
  };

  const getVariant = (method: PaymentMethod) => 
    paymentMethod === method ? 'primary' : 'outline-secondary';

  const paidNumber = parseFloat(amountPaid);
  const change = isNaN(paidNumber) ? 0 : paidNumber - total;
  const isInsufficient = !isNaN(paidNumber) && paidNumber > 0 && change < 0;

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static" size="lg">
      <Modal.Header closeButton={!loading}>
        <Modal.Title className="fw-bold">Finalizar Venta</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4">
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Total */}
        <div className="text-center mb-4 p-3 bg-light rounded-3">
          <small className="text-muted text-uppercase fw-bold letter-spacing-1">Total a Cobrar</small>
          <div className="display-3 fw-bolder text-success">
            ${total.toFixed(2)}
          </div>
        </div>

        <Form.Label className="fw-bold fs-5 mb-3">Seleccione Método de Pago:</Form.Label>
        <Row className="g-3 mb-4">
          <Col xs={4}>
            <Button 
              variant={getVariant('efectivo')} 
              className="w-100 py-4 d-flex flex-column align-items-center shadow-sm"
              onClick={() => setPaymentMethod('efectivo')}
              disabled={loading}
            >
              <FaMoneyBillWave size={32} className="mb-2" />
              <span className="fs-5">Efectivo</span>
            </Button>
          </Col>
          <Col xs={4}>
            <Button 
              variant={getVariant('tarjeta')} 
              className="w-100 py-4 d-flex flex-column align-items-center shadow-sm"
              onClick={() => setPaymentMethod('tarjeta')}
              disabled={loading}
            >
              <FaCreditCard size={32} className="mb-2" />
              <span className="fs-5">Tarjeta</span>
            </Button>
          </Col>
          <Col xs={4}>
            <Button 
              variant={getVariant('qr')} 
              className="w-100 py-4 d-flex flex-column align-items-center shadow-sm"
              onClick={() => setPaymentMethod('qr')}
              disabled={loading}
            >
              <FaQrcode size={32} className="mb-2" />
              <span className="fs-5">QR / Apps</span>
            </Button>
          </Col>
        </Row>

        {/* Sección de Cálculo de Vuelto (Solo visible en Efectivo) */}
        {paymentMethod === 'efectivo' && (
          <div className="mt-4 pt-3 border-top animate__animated animate__fadeIn">
            <Row className="align-items-center">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-muted fw-bold">Monto Abonado (¿Con cuánto paga?)</Form.Label>
                  <InputGroup size="lg">
                    <InputGroup.Text className="bg-white border-end-0 text-muted">$</InputGroup.Text>
                    <Form.Control
                      type="number"
                      placeholder="0.00"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="border-start-0 fw-bold fs-4"
                      autoFocus
                    />
                  </InputGroup>
                  {isInsufficient && (
                    <div className="text-danger mt-1 fw-bold">
                      ⚠ Faltan ${(Math.abs(change)).toFixed(2)}
                    </div>
                  )}
                </Form.Group>
              </Col>
              
              <Col md={6} className="text-end">
                <div className="p-3 rounded-3 border" style={{backgroundColor: change >= 0 ? '#e8f5e9' : '#ffebee'}}>
                  <div className="text-muted text-uppercase fw-bold small">Su Vuelto</div>
                  <div className={`display-6 fw-bold ${change >= 0 ? 'text-success' : 'text-danger'}`}>
                    ${change >= 0 ? change.toFixed(2) : '0.00'}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}

      </Modal.Body>

      <Modal.Footer className="p-3">
        <Button variant="secondary" size="lg" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          variant="success" 
          size="lg"
          onClick={handleConfirm} 
          disabled={loading || isInsufficient}
          className="px-5 fw-bold"
        >
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" className="me-2"/>
              Procesando...
            </>
          ) : (
            <>
              <FaCheckCircle className="me-2" /> Confirmar Venta
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;