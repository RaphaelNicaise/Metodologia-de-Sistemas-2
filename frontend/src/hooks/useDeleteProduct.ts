import { useState } from "react"
import { deleteProductApi } from "../api/productService";

const useDeleteProduct = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteProduct = async (productId: number) => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await deleteProductApi(productId);
            return result;

        } catch (err) { 
            console.error("Error deleting product", err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Ocurrió un error desconocido al eliminar");
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }
    
    return { deleteProduct, loading, error };
}

export default useDeleteProduct;