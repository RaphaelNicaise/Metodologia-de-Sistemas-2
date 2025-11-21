import { useState } from 'react';
import { createSaleApi } from '../api/salesService';
import type { CreateSalePayload, SaleResponse } from '../types/Sale';

const useCreateSale = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSale = async (payload: CreateSalePayload): Promise<SaleResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await createSaleApi(payload);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido al crear la venta";
      setError(msg);
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createSale, loading, error };
};

export default useCreateSale;