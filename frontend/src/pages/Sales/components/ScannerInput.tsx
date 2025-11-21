import React, { useState, useRef, useEffect } from 'react';
import { FaBarcode } from "react-icons/fa6";
import { Alert } from 'react-bootstrap';
import type { Product } from '../../../types/Product';

interface Props {
  products: Product[];
  onScan: (product: Product) => void;
}

const ScannerInput = ({ products, onScan }: Props) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus al cargar
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Mantener el foco siempre 
  const handleBlur = () => {
    // setTimeout(() => inputRef.current?.focus(), 100); 
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  const handleScan = () => {
    if (!inputValue.trim()) return;

    const term = inputValue.toLowerCase().trim();
    
    // Buscar coincidencia exacta por código de barras O coincidencia parcial por nombre
    const found = products.find(p => 
      p.barcode === term || p.name.toLowerCase().includes(term)
    );

    if (found) {
      onScan(found);
      setInputValue('');
      setError(null);
    } else {
      setError(`Producto no encontrado: "${inputValue}"`);
      setInputValue('');
    }
  };

  return (
    <div className="scanner-section">
      <h2 className="scanner-title">Punto de Venta</h2>
      <p className="opacity-75">Escanea productos para agregar al carrito</p>
      
      <div className="scanner-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="scanner-input"
          placeholder="Escanear código o escribir nombre..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          autoComplete="off"
        />
        <div style={{position: 'absolute', right: '25px', top: '50%', transform: 'translateY(-50%)', color: 'white'}}>
            <FaBarcode size={32} />
        </div>
      </div>

      {error && (
        <Alert variant="warning" className="mt-3 mb-0 py-2 d-inline-block">
          {error}
        </Alert>
      )}
    </div>
  );
};

export default ScannerInput;