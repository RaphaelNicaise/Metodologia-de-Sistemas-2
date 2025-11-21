import { useState } from 'react';
import { Toast, ToastContainer, Spinner } from 'react-bootstrap';
import Header from '../../layouts/Header/Header';
import Navbar from '../../components/Navbar';
import useCart from '../../hooks/useCart';
import useGetProducts from '../../hooks/useGetProducts'; 
import useCreateSale from '../../hooks/useCreateSale';
import ScannerInput from './components/ScannerInput';
import PosCart from './components/PosCart';
import PaymentModal from './components/PaymentModal';
import type { PaymentMethod, CreateSalePayload } from '../../types/Sale';
import './Sales.css';

const Sales = () => {
  const { cart, addToCart, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const { products, loading: productsLoading } = useGetProducts();
  const { createSale, loading: saleLoading, error: saleError } = useCreateSale();
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleConfirmSale = async (method: PaymentMethod) => {
    const payload: CreateSalePayload = {
      payment_method: method,
      products: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: Number(item.price)
      }))
    };

    const response = await createSale(payload);

    if (response && response.success) {
      setShowPaymentModal(false);
      clearCart();
      setShowSuccessToast(true);
      console.log("Ticket de venta generado:", response.sale);
      if (response.sale.ticket_url) {
        window.open(response.sale.ticket_url, '_blank');
      }
    }
  };

  return (
    <div className="d-flex flex-column vh-100">
      <Header />

      <div className="d-flex flex-grow-1 overflow-hidden">
        <Navbar />

        <main className="pos-layout w-100">
          <div className="pos-main-area">
            <div className="pos-container">
              
              {/* ESCÁNER */}
              {productsLoading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" variant="primary" /> Cargando catálogo...
                </div>
              ) : (
                <ScannerInput 
                  products={products} 
                  onScan={addToCart} 
                />
              )}

              {/* LISTA DE PRODUCTOS */}
              <PosCart 
                items={cart} 
                onRemove={removeFromCart} 
                onUpdateQuantity={updateQuantity}
                onClear={clearCart}
              />

              {/* TOTAL Y BOTÓN */}
              <div className="checkout-section">
                <div>
                  <div className="total-label">Total a Pagar</div>
                  <div className="total-amount">${Number(total).toFixed(2)}</div>
                </div>
                <button 
                  className="checkout-btn"
                  disabled={cart.length === 0}
                  onClick={() => setShowPaymentModal(true)}
                >
                  Confirmar Venta
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>

      <PaymentModal 
        show={showPaymentModal}
        total={total}
        loading={saleLoading}
        error={saleError}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handleConfirmSale}
      />

      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast onClose={() => setShowSuccessToast(false)} show={showSuccessToast} delay={3000} autohide bg="success">
          <Toast.Header><strong className="me-auto">Éxito</strong></Toast.Header>
          <Toast.Body className="text-white">Venta registrada correctamente.</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default Sales;