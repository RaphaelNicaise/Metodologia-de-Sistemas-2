import { useState } from "react";
import { createProductApi } from "../api/productService";

const useCreateProduct = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createProduct = async (productData) => {
        setLoading(true);
        setError(null);

        try {
            const data = await createProductApi(productData);
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