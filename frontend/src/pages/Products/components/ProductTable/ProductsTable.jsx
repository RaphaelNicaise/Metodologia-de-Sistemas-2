import React, { useState, useMemo } from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { MdCancel } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import useDeleteProduct from "../../../../hooks/useDeleteProduct";
import DeleteProductDialog from "./DeleteProductDialog";
import SortableHeader from "./SortableHeader";
import { StyledTableCell, StyledTableRow, BodyTableCell } from './ProductsTable.styles';
import '../../../../styles/Products.css';
import Snackbar from '@mui/material/Snackbar'; // <-- AGREGA ESTA LÍNEA
import Alert from '@mui/material/Alert';

const ProductsTable = ({ products = [], onEdit, onProductDeleted }) => {
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const { deleteProduct, loading, error } = useDeleteProduct();

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleDeleteClick = (productId, productName) => {
    setDeleteConfirm({ id: productId, name: productName });
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

    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error al eliminar el producto: ${error.message}`,
        severity: 'error'
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
    return [...products].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (orderBy === 'price' || orderBy === 'stock') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [products, orderBy, order]);

  return (
    <>
      <TableContainer
        component={Paper}
        className="table-container"
      >
        <Table className="products-table">
          <TableHead>
            <TableRow>
              <SortableHeader
                label="Nombre"
                property="name"
                hasRightBorder
                isActive={orderBy === 'name'}
                direction={order}
                onSort={handleSort}
              />
              <SortableHeader
                label="Categoría"
                property="category"
                hasRightBorder
                isActive={orderBy === 'category'}
                direction={order}
                onSort={handleSort}
              />
              <SortableHeader
                label="Precio"
                property="price"
                hasRightBorder
                isActive={orderBy === 'price'}
                direction={order}
                onSort={handleSort}
              />
              <SortableHeader
                label="Stock"
                property="stock"
                hasRightBorder
                isActive={orderBy === 'stock'}
                direction={order}
                onSort={handleSort}
              />
              <StyledTableCell>Código de Barra</StyledTableCell>
              <StyledTableCell align="center">Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedProducts.map(({ id, name, barcode, price, stock, url_image, category }) => {
              const imageToShow = url_image && url_image.length > 0
                ? url_image[0]
                : '/Image-not-found.png';
              return (
                <StyledTableRow key={id}>
                  <BodyTableCell hasrightborder="true">
                    <img
                      src={imageToShow}
                      alt={name}
                      className="product-image"
                    />
                  </BodyTableCell>
                  <BodyTableCell hasrightborder="true">{name}</BodyTableCell>
                  <BodyTableCell hasrightborder="true">{category}</BodyTableCell>
                  <BodyTableCell hasrightborder="true">${price}</BodyTableCell>
                  <BodyTableCell hasrightborder="true">{stock}</BodyTableCell>
                  <BodyTableCell>{barcode}</BodyTableCell>
                  <BodyTableCell>
                    <div className="btn">
                      <div
                        className={`btn-edit ${loading ? 'btn-disabled' : ''}`}
                        onClick={() => onEdit && onEdit(id)}
                        title={loading ? "Espere..." : "Editar producto"}
                      >
                        <FaEdit />
                      </div>
                      <div
                        className={`btn-erase ${loading ? 'btn-disabled' : ''}`}
                        onClick={() => !loading && handleDeleteClick(id, name)}
                        title={loading ? "Eliminando..." : "Eliminar producto"}
                      >
                        <MdCancel />
                      </div>
                    </div>
                  </BodyTableCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <DeleteProductDialog
        open={!!deleteConfirm}
        loading={loading}
        productName={deleteConfirm?.name}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className="custom-snackbar"
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          className="snackbar-alert"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductsTable;