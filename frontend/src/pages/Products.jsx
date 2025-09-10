import React from "react";
import useGetProducts from "../hooks/useGetProducts";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import '../styles/Products.css';


const Products = () => {
    const { products, loading, error } = useGetProducts();

    if (loading) return <p className="loading">Cargando productos...</p>
    if (error) return <p className="error">Error: {error}</p>

    return (
        <>
            <Header />
            <div className="main-layout">
                <Navbar/>
                <div className="post-container">
                    <h1>Productos</h1>
                    {products.length === 0 ? (
                        <p className="no-products">No hay Productos</p>
                    ) : (
                        products.map(product => (
                            <ProductCard key={product.id}{...product} />
                        ))
                    )}
                </div>
            </div>
        </>
    )
}

export default Products;