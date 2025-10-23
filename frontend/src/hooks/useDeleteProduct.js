import { useState } from "react"
import { deleteProductApi } from "../api/productService";

const useDeleteProduct = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const deleteProduct = async (productId) => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await deleteProductApi(productId);
            return result;

        } catch (error) {
            console.error("Error deleting product", error);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }
    
    return { deleteProduct, loading, error };
}

export default useDeleteProduct;