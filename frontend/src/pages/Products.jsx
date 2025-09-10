import React, { useState } from "react";
import useGetProducts from "../hooks/useGetProducts";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import ProductsTable from "../components/ProductsTable";
import SearchInput from "../components/SearchInput"; // Componente extraído
import '../styles/Products.css'

const Products = () => {
    const { products, loading, error } = useGetProducts();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Header />
            <div className="main-layout">
                <Navbar />
                <div className="post-container">
                    <h1>Productos</h1>

                    <SearchInput 
                        onSearch={setSearchTerm}
                        placeholder="Buscar productos..." 
                    />
        
                    {loading && <p>Cargando productos...</p>}
                    {error && <p>Error: {error}</p>}

                    {!loading && !error && filteredProducts.length > 0 && (
                        <ProductsTable products={filteredProducts} />
                    )}

                    {!loading && !error && filteredProducts.length === 0 && (
                        <p>No hay productos{searchTerm ? ` que coincidan con "${searchTerm}"` : ''}</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default Products;