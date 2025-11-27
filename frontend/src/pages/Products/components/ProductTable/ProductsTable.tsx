import { useState, useMemo } from "react";
import { Table, Card, Image, Button, Toast, ToastContainer, Alert } from 'react-bootstrap';
import { MdCancel } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import DeleteProductDialog from "./DeleteProductDialog";
import EditProduct from "../EditProduct/EditProduct";
import SortableHeader from "./SortableHeader";
import './ProductTable.css';
import useDeleteProduct from "../../../../hooks/useDeleteProduct";
import type { Product } from "../../../../types/Product";

interface Props {
  products: Product[];
  onEdit: (id: number) => void;
  onProductDeleted: (id: number) => void;
}

type Order = 'asc' | 'desc';
type DeleteConfirmState = { id: number; name: string } | null;

type SnackbarState = {
  open: boolean;
  message: string;
  severity: 'success' | 'danger' | 'warning' | 'info'; 
}

type ProductSortKey = 'name' | 'category' | 'price' | 'stock';

const ProductsTable = ({ products = [], onEdit, onProductDeleted }: Props) => {

  const [orderBy, setOrderBy] = useState<ProductSortKey>('name');
  const [order, setOrder] = useState<Order>('asc');
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });

  const { deleteProduct, loading } = useDeleteProduct();

  const handleSort = (property: ProductSortKey) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleDeleteClick = (productId: number, productName: string) => {
    setDeleteConfirm({ id: productId, name: productName });
  };

  const handleEditClick = (product: Product) => {
    setEditProduct(product);
  };

  const closeEditModal = () => {
    setEditProduct(null);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteProduct(deleteConfirm.id);

      setSnackbar({
        open: true,
        message: `Producto "${deleteConfirm.name}" eliminado correctamente`,
        severity: 'success'
      });

      if (onProductDeleted) {
        onProductDeleted(deleteConfirm.id);
      }

      window.location.reload(); 

    } catch (err) {
      let message = "Error al eliminar el producto";
      if (err instanceof Error) {
        message = `Error al eliminar el producto: ${err.message}`;
      }
      setSnackbar({
        open: true,
        message: message,
        severity: 'danger' 
      });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const sortedProducts = useMemo(() => {
    return [...products].sort((a: Product, b: Product) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aLower = aValue.toLowerCase();
        const bLower = bValue.toLowerCase();
        if (aLower < bLower) return order === 'asc' ? -1 : 1;
        if (aLower > bLower) return order === 'asc' ? 1 : -1;
        return 0;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        if (aValue < bValue) return order === 'asc' ? -1 : 1;
        if (aValue > bValue) return order === 'asc' ? 1 : -1;
        return 0;
      }
      
      return 0;
    });
  }, [products, orderBy, order]);

  return (
    <>
      <Card className="table-container shadow-sm">
        <Card.Body>

          <Table striped bordered hover responsive className="products-table">
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Imagen</th> 
                
                <SortableHeader
                  label="Nombre"
                  property="name"
                  isActive={orderBy === 'name'}
                  direction={order}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Categoría"
                  property="category"
                  isActive={orderBy === 'category'}
                  direction={order}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Precio"
                  property="price"
                  isActive={orderBy === 'price'}
                  direction={order}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Stock"
                  property="stock"
                  isActive={orderBy === 'stock'}
                  direction={order}
                  onSort={handleSort}
                />
                <th>Código de Barra</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product) => {
                const { id, name, barcode, price, stock, url_image, category } = product;
                const imageToShow = url_image || '/Image-not-found.png';
                
                return (
                  <tr key={id}>
                    <td className="text-center align-middle">
                      <Image
                        src={imageToShow}
                        alt={name}
                        className="product-image" 
                        thumbnail 
                      />
                    </td>
                    <td className="align-middle">{name}</td>
                    <td className="align-middle">{category}</td>
                    <td className="align-middle">${price}</td>
                    <td className="align-middle">{stock}</td>
                    <td className="align-middle">{barcode}</td>
                    <td className="align-middle">
                      <div className="action-btn-container">
                        <Button
                          variant="link" 
                          className={`action-btn btn-edit ${loading ? 'btn-disabled' : ''}`}
                          onClick={() => handleEditClick(product)}
                          title={loading ? "Espere..." : "Editar producto"}
                          disabled={loading}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="link"
                          className={`action-btn btn-erase ${loading ? 'btn-disabled' : ''}`}
                          onClick={() => !loading && handleDeleteClick(id, name)}
                          title={loading ? "Eliminando..." : "Eliminar producto"}
                          disabled={loading}
                        >
                          <MdCancel />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {editProduct && (
        <EditProduct
          product={editProduct}
          onClose={closeEditModal}
        />
      )}

      <DeleteProductDialog
        open={!!deleteConfirm}
        loading={loading}
        productName={deleteConfirm?.name}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
      />

 
      <ToastContainer
        position="bottom-end" 
        className="p-3" 
        style={{ zIndex: 9999 }} 
      >
        <Toast
          show={snackbar.open} 
          onClose={closeSnackbar}
          delay={6000} 
          autohide
          bg={snackbar.severity === 'danger' ? 'danger' : snackbar.severity}
        >
          <Alert
            variant={snackbar.severity}
            onClose={closeSnackbar}
            dismissible
            className="mb-0" 
          >
            <Alert.Heading as="h6" className="mb-1">
              {snackbar.severity === 'success' ? 'Éxito' : 'Error'}
            </Alert.Heading>
            {snackbar.message}
          </Alert>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default ProductsTable;