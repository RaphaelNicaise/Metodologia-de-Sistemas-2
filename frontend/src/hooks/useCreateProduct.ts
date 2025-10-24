import { useState } from "react";
import { createProductApi } from "../api/productService";
import type { Product, CreateProductData } from "../types/Product";

const useCreateProduct = () => {
  const [data, setData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProduct = async (productData: CreateProductData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await createProductApi(productData);
      setData(data);
      return data;

    } catch (err) { 
      console.error("Error creating product", err);
      if (err instanceof Error) {
        setError(err.message); 
      } else {
        setError("Ocurrió un error desconocido");
      }
      throw err; 
    } finally {
      setLoading(false);
    }
  }
  return { createProduct, loading, error, data };
}

export default useCreateProduct;