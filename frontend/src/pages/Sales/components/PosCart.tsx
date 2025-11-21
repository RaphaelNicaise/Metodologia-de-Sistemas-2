import { Button } from 'react-bootstrap';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import type { CartItem } from '../../../types/Sale';

interface Props {
  items: CartItem[];
  onRemove: (id: number) => void;
  onUpdateQuantity: (id: number, qty: number) => void;
  onClear: () => void;
}

const PosCart = ({ items, onRemove, onUpdateQuantity, onClear }: Props) => {
  return (
    <div className="cart-section">
      <div className="cart-header-pos">
        <h4 className="m-0 text-dark fw-bold">Carrito de Compras</h4>
        {items.length > 0 && (
          <Button variant="outline-danger" onClick={onClear}>
            Limpiar Carrito
          </Button>
        )}
      </div>

      <div className="cart-list-scroll">
        {items.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <div style={{ fontSize: '5rem', marginBottom: '15px', opacity: 0.2 }}>🛒</div>
            <h4>El carrito está vacío</h4>
            <p className="fs-5">Usa el buscador superior para agregar productos.</p>
          </div>
        ) : (
          items.map((item) => {
             const price = Number(item.price);
             const subtotal = Number(item.subtotal);
             const imageToShow = item.url_image || '/Image-not-found.png';

             return (
              <div key={item.id} className="cart-item-card">
                <img 
                  src={imageToShow} 
                  alt={item.name} 
                  className="item-img" 
                  onError={(e) => { (e.target as HTMLImageElement).src = '/Image-not-found.png' }}
                />
                
                <div className="item-details">
                  <h5 className="item-name">{item.name}</h5>
                  <span className="item-price">${price.toFixed(2)} x unidad</span>
                </div>

                <div className="item-controls">
                  <Button 
                    variant="primary" 
                    className="px-3 py-2"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  >
                    <FaMinus size={14} />
                  </Button>
                  
                  <span className="fw-bold fs-4" style={{minWidth: '40px', textAlign: 'center'}}>
                    {item.quantity}
                  </span>
                  
                  <Button 
                    variant="primary" 
                    className="px-3 py-2"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    <FaPlus size={14} />
                  </Button>
                </div>

                <div className="item-subtotal">
                  ${subtotal.toFixed(2)}
                </div>

                <Button 
                  variant="danger" 
                  className="ms-4 rounded-circle p-3 d-flex align-items-center justify-content-center"
                  onClick={() => onRemove(item.id)}
                  title="Eliminar producto"
                >
                  <FaTrash size={18} />
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PosCart;