import { useState, useEffect } from "react"
import { getProductsApi } from "../api/productService";

const useGetProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProductsApi();
        
                setProducts(data);

            } catch (error) {
                console.error("Error fetching products", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return { products, loading, error };
}

export default useGetProducts;