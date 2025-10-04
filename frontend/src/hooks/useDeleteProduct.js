import React, { useState } from "react"

const useDeleteProduct = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const deleteProduct = async (productId) => {
        if(!productId){
            const errorMsg = "Se require el ID del producto";
            setError(errorMsg);
            throw new Error(errorMsg);
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`http://localhost:5000/api/productos/${productId}`, {
                method: "DELETE",
                headers:{
                    'Accept': 'application/json',
                    'Content-type': 'application/json',
                }
            })
            if(!res.ok) throw new Error(`Error http: ${res.status} ${res.statusText}`);
            return {success:true}
        } catch (error) {
            console.error("Error deleting product", error);
            setError(error.message);
            throw error;
        }finally{
            setLoading(false);
        }
    }
    return {deleteProduct, loading, error};
}

export default useDeleteProduct;