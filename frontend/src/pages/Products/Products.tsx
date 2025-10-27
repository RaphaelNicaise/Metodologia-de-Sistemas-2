import { useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import type { Product } from "../../types/Product";
import useGetProducts from "../../hooks/useGetProducts";
import Header from "../../layouts/Header/Header";
import Navbar from "../../components/Navbar";
import ProductsTable from "./components/ProductTable/ProductsTable";
import SearchInput from "../../components/common/SearchInput";
import CreateProduct from "./components/CreateProduct";
import { FaPlus } from "react-icons/fa6";
import './Products.css';

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

      <div className="d-flex main-layout-rb">
        <Navbar />

        <Container fluid as="main" className="flex-grow-1 p-4 product-container-rb">
          <h1 className="product-page-title">Productos</h1>

          <Row className="mb-3 align-items-center">
            <Col md={6} lg={4}>
              <SearchInput
                onSearch={setSearchTerm}
                placeholder="Buscar productos..."
              />
            </Col>

            <Col md={6} lg={8} className="d-flex justify-content-end">
              <Button
                variant="success"
                onClick={() => setIsOpen(true)}
                className="d-flex align-items-center gap-2"
              >
                <FaPlus />
                <span>Agregar Producto</span>
              </Button>
            </Col>
          </Row>

          {loading && (
            <div className="text-center p-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando productos...</span>
              </Spinner>
            </div>
          )}
          
          {error && <Alert variant="danger">Error: {error}</Alert>}

          {!loading && !error && filteredProducts.length > 0 && (
            <ProductsTable
              products={filteredProducts}
              onEdit={handleEdit}
              onProductDeleted={handleProductDeleted}
            />
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <Alert variant="info">
              No hay productos
              {searchTerm ? ` que coincidan con "${searchTerm}"` : ''}
            </Alert>
          )}
          
        </Container>

        {isOpen && (
          <CreateProduct onClose={() => setIsOpen(false)} />
        )}
      </div>
    </>
  );
};

export default Products;