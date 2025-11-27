import { useState } from 'react';
import { updateProductApi } from '../api/productService';
import type { CreateProductData, Product } from '../types/Product';

const useUpdateProduct = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateProduct = async (
        productId: number,
        productData: Partial<CreateProductData>
    ): Promise<Product> => {
        try {
            setLoading(true);
            setError(null);
            const updatedProduct = await updateProductApi(productId, productData);
            return updatedProduct;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error updating product';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { updateProduct, loading, error };
};

export default useUpdateProduct;
