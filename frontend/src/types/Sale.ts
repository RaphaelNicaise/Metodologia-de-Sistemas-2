import type { Product } from "./Product";

export interface CartItem extends Product {
  quantity: number;
  subtotal: number; 
}

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'qr' | 'transferencia';

export interface SaleProductPayload {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface CreateSalePayload {
  payment_method: PaymentMethod;
  ticket_url?: string;     
  invoice_state?: string;  
  products: SaleProductPayload[];
}

export interface SaleResponse {
  success: boolean;
  message: string;
  sale: {
    id: number;
    total_amount: number;
    sale_date: string;
    ticket_url?: string;
  };
}