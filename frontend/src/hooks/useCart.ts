import { useState, useMemo, useCallback } from 'react';
import type { Product } from '../types/Product';
import type { CartItem } from '../types/Sale';

const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: Product) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.id === product.id);
      const priceAsNumber = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

      if (existingItemIndex >= 0) {
        const updatedCart = [...prevCart];
        const currentItem = updatedCart[existingItemIndex];

        if (currentItem.quantity + 1 > product.stock) {
          console.warn(`No hay suficiente stock para agregar más de ${product.name}`);
          return prevCart;
        }

        updatedCart[existingItemIndex] = {
          ...currentItem,
          quantity: currentItem.quantity + 1,
          subtotal: (currentItem.quantity + 1) * priceAsNumber,
        };
        return updatedCart;
      } else {
        if (product.stock < 1) {
            console.warn("Producto sin stock");
            return prevCart;
        }
        
        const newItem: CartItem = {
          ...product,
          quantity: 1,
          subtotal: priceAsNumber,
        };
        return [...prevCart, newItem];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, newQuantity: number) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === productId) {
          const validQuantity = Math.max(1, Math.min(newQuantity, item.stock));
          const priceAsNumber = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
          return {
            ...item,
            quantity: validQuantity,
            subtotal: validQuantity * priceAsNumber
          };
        }
        return item;
      });
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.subtotal, 0);
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    totalItems
  };
};

export default useCart;