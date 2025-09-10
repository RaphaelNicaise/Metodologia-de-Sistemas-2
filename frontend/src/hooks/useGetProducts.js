import { useState, useEffect } from "react"

const useGetProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/productos", {
                    method: "GET",
                    headers: {
                        'Accept': 'application/json',
                    },
                    credentials: 'omit'
                });
                const data = await res.json();
                if (!res.ok) throw new Error(`Error http: ${res.status} ${res.statusText}`);
                setProducts(data || []);
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