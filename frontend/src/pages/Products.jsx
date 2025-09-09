import React from "react";
import useGetProducts from "../hooks/useGetProducts";
import ProductCard from "../components/ProductCard";

const Products = () => {
    const { products, loading, error } = useGetProducts();

    if(loading) return <p className="loading">Cargando productos...</p>
    if(error) return <p className="error">Error: {error}</p>

    return(
        <div className="post-container">
            {products.length === 0 ? (
                <p className="no-products">No hay Productos</p>
            ) : (
                products.map(product => (
                    <ProductCard key={product.id}{...product}/>
                ))
            )}
        </div>
    )
}

export default Products;