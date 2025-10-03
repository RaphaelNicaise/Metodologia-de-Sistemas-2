import React, { useState } from "react";

const useCreateProduct = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createProduct = async (productData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("http://localhost:5000/api/productos/", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json',
                },
                body: JSON.stringify(productData)
            })
            const data = await res.json();

            if (!res.ok) throw new Error(`Error http: ${res.status} ${res.statusText}`);
            setData(data);
            return data;

        } catch (error) {
            console.error("Error creating product", error);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }
    return { createProduct, loading, error, data };
}
export default useCreateProduct;
