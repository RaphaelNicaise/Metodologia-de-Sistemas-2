import { useState, useEffect } from "react";
import { getProductsApi } from "../api/productService";
import type { Product } from "../types/Product";

const useGetProducts = () => {

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {

                const data = await getProductsApi();
                setProducts(data);

            } catch (err) { 
                console.error("Error fetching products", err);
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Ocurrió un error desconocido al obtener los productos");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return { products, loading, error };
}

export default useGetProducts;