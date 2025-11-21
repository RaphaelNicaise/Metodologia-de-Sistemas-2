import type { CreateSalePayload, SaleResponse } from '../types/Sale';

const API_URL = "http://localhost:5000/api/sales/";

export const createSaleApi = async (saleData: CreateSalePayload): Promise<SaleResponse> => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(saleData)
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Error http: ${res.status}`);
  }

  return data;
};