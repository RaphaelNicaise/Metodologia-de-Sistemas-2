const { useState, useEffect } = require("react")

const useGetProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/productos", {
                    method: "GET",
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Error al obtener los posts");
                setProducts(data || []);
            } catch (error) {
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