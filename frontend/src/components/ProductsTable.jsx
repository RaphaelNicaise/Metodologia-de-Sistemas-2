import React, { useState, useMemo } from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { MdCancel } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import useDeleteProduct from "../hooks/useDeleteProduct";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import '../styles/ProductTable.css';

// Componente para los indicadores de ordenamiento
const SortIndicator = ({ isActive, direction }) => {
  return (
    <Box component="span" className="sort-indicator">
      {isActive ? (
        direction === 'asc' ?
          <span className="sort-arrow asc">▲</span> :
          <span className="sort-arrow desc">▼</span>
      ) : (
        <Box className="sort-indicator-inactive">
          <span className="sort-arrow-small up">▲</span>
          <span className="sort-arrow-small down">▼</span>
        </Box>
      )}
    </Box>
  );
};

// Estilos personalizados para las celdas de encabezado
const StyledTableCell = styled(TableCell)(({ theme, hasrightborder = "false" }) => ({
  fontWeight: 'bold',
  cursor: 'pointer',
  padding: '16px 12px',
  borderBottom: '2px solid',
  borderBottomColor: theme.palette.divider,
  borderRight: hasrightborder === "true" ? '1px solid #e0e0e0' : 'none',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  transition: 'background-color 0.2s ease',
  position: 'relative',
}));

// Estilos para las filas de la tabla
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.grey[50],
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
  transition: 'background-color 0.2s ease',
}));

// Estilo para celdas del cuerpo con bordes verticales
const BodyTableCell = styled(TableCell)(({ theme, hasrightborder = "false" }) => ({
  padding: '12px',
  borderRight: hasrightborder === "true" ? '1px solid #e0e0e0' : 'none',
  position: 'relative',
}));

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

  const SortableHeader = ({ label, property, hasRightBorder = false }) => {
    const isActive = orderBy === property;
    return (
      <StyledTableCell
        onClick={() => handleSort(property)}
        hasrightborder={hasRightBorder ? "true" : "false"}
      >
        <Box className="sortable-header-content">
          {label}
          <SortIndicator isActive={isActive} direction={order} />
        </Box>
      </StyledTableCell>
    );
  };

  return (
    <>
      <TableContainer
        component={Paper}
        className="table-container"
      >
        <Table className="products-table">
          <TableHead>
            <TableRow>
              <StyledTableCell hasrightborder="true">Imagen</StyledTableCell>
              <SortableHeader label="Nombre" property="name" hasRightBorder />
              <SortableHeader label="Categoría" property="category" hasRightBorder />
              <SortableHeader label="Precio" property="price" hasRightBorder />
              <SortableHeader label="Stock" property="stock" hasRightBorder />
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

      <Dialog
        open={!!deleteConfirm}
        onClose={cancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="delete-dialog"
      >
        <DialogTitle id="alert-dialog-title" className="dialog-title">
          Confirmar eliminación
        </DialogTitle>
        <DialogContent className="dialog-content">
          ¿Estás seguro de que deseas eliminar el producto "{deleteConfirm?.name}"? 
          Esta acción no se puede deshacer.
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={cancelDelete} disabled={loading} className="dialog-cancel-btn">
            Cancelar
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            disabled={loading}
            className="dialog-confirm-btn"
            startIcon={loading ? <CircularProgress size={16} className="loading-spinner" /> : null}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

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