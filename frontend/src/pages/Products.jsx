import React, { useState } from "react";
import useGetProducts from "../hooks/useGetProducts";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import ProductsTable from "../components/ProductsTable";
import SearchInput from "../components/SearchInput";
import { FaPlus } from "react-icons/fa6";
import CreateProduct from "../components/CreateProduct"; 
import '../styles/Products.css'

const Products = () => {
  const { products, loading, error } = useGetProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header />
      <div className="main-layout">
        <Navbar />
        <div className="product-container">
          <h1>Productos</h1>

          <div className="table-component">
            <div className="table-search-input">
              <SearchInput
                onSearch={setSearchTerm}
                placeholder="Buscar productos..."
              />
            </div>

            <div className="table-add-btn">
              <button onClick={() => setIsOpen(true)}><FaPlus /><span>Agregar Producto</span></button>
            </div>
          </div>

          {loading && <p>Cargando productos...</p>}
          {error && <p>Error: {error}</p>}

          {!loading && !error && filteredProducts.length > 0 && (
            <ProductsTable products={filteredProducts} />
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <p>No hay productos{searchTerm ? ` que coincidan con "${searchTerm}"` : ''}</p>
          )}
        </div>

        {isOpen && (
          <CreateProduct onClose={() => setIsOpen(false)} />
        )}
      </div>
    </>
  );
};

export default Products;
