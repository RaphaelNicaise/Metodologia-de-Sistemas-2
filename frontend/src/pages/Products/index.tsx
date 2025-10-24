import  { useState } from "react";
import type { Product } from "../../types/Product"; 
import useGetProducts from "../../hooks/useGetProducts";
import Header from "../../layouts/Header/Header";
import Navbar from "../../components/Navbar"; 
import ProductsTable from "./components/ProductTable/ProductsTable"; 
import SearchInput from "../../components/common/SearchInput"; 
import { FaPlus } from "react-icons/fa6";
import CreateProduct from "./components/CreateProduct";
import '../../styles/Products.css';

const Products = () => {
  const { products, loading, error } = useGetProducts();
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const filteredProducts = products.filter((product: Product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleEdit = (id: number) => {
    console.log("TODO: Abrir modal para editar producto con ID:", id);
  };

  const handleProductDeleted = (id: number) => {
    console.log("El producto con ID:", id, "fue eliminado y la página se recargará.");
  };

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

            <ProductsTable 
              products={filteredProducts} 
              onEdit={handleEdit}
              onProductDeleted={handleProductDeleted}
            />
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