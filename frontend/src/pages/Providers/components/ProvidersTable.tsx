import { useState, useMemo } from "react";
import { Table, Card, Button, Toast, ToastContainer, Alert, Spinner } from 'react-bootstrap';
import { MdCancel } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import DeleteProviderDialog from "./DeleteProviderDialog";
import EditProvider from "./EditProvider";
import SortableHeader from "./SortableHeader";
import './ProvidersTable.css';
import useDeleteProvider from "../../../hooks/useDeleteProvider";
import useGetProviders from "../../../hooks/useGetProviders";
import type { Provider } from "../../../types/provider";

type Order = 'asc' | 'desc';
type DeleteConfirmState = { id: number; name: string } | null;

type SnackbarState = {
  open: boolean;
  message: string;
  severity: 'success' | 'danger' | 'warning' | 'info';
}

type ProviderSortKey = 'name' | 'contact_email' | 'phone_number';

const ProvidersTable = () => {
  const { providers, loading: loadingProviders, error } = useGetProviders();

  console.log('ProvidersTable render:', { providers, loadingProviders, error });

  const [orderBy, setOrderBy] = useState<ProviderSortKey>('name');
  const [order, setOrder] = useState<Order>('asc');
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>(null);
  const [editProvider, setEditProvider] = useState<Provider | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });

  const { deleteProvider, loading } = useDeleteProvider();

  const handleSort = (property: ProviderSortKey) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleDeleteClick = (providerId: number, providerName: string) => {
    setDeleteConfirm({ id: providerId, name: providerName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteProvider(deleteConfirm.id);

      setSnackbar({
        open: true,
        message: `Proveedor "${deleteConfirm.name}" eliminado correctamente`,
        severity: 'success'
      });

      window.location.reload();

    } catch (err) {
      let message = "Error al eliminar el proveedor";
      if (err instanceof Error) {
        message = `Error al eliminar el proveedor: ${err.message}`;
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

  const handleEditClick = (provider: Provider) => {
    setEditProvider(provider);
  };

  const closeEditModal = () => {
    setEditProvider(null);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const sortedProviders = useMemo(() => {
    if (!providers) return [];
    
    return [...providers].sort((a: Provider, b: Provider) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aLower = aValue.toLowerCase();
        const bLower = bValue.toLowerCase();
        if (aLower < bLower) return order === 'asc' ? -1 : 1;
        if (aLower > bLower) return order === 'asc' ? 1 : -1;
        return 0;
      }

      return 0;
    });
  }, [providers, orderBy, order]);

  if (loadingProviders) {
    return (
      <Card className="table-container shadow-sm">
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-3 text-muted">Cargando proveedores...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="table-container shadow-sm">
        <Card.Body>
          <Alert variant="danger">
            Error al cargar proveedores: {error}
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="table-container shadow-sm">
        <Card.Body>
          <Table striped bordered hover responsive className="providers-table">
            <thead>
              <tr>
                <SortableHeader
                  label="Nombre"
                  property="name"
                  isActive={orderBy === 'name'}
                  direction={order}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Email"
                  property="contact_email"
                  isActive={orderBy === 'contact_email'}
                  direction={order}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Teléfono"
                  property="phone_number"
                  isActive={orderBy === 'phone_number'}
                  direction={order}
                  onSort={handleSort}
                />
                <th>Dirección</th>
                <th>Descripción</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedProviders.map((provider) => {
                const { id, name, contact_email, phone_number, address, description } = provider;
                return (
                  <tr key={id}>
                    <td className="align-middle">{name}</td>
                    <td className="align-middle">{contact_email}</td>
                    <td className="align-middle">{phone_number}</td>
                    <td className="align-middle">{address}</td>
                    <td className="align-middle">{description}</td>
                    <td className="align-middle">
                      <div className="action-btn-container">
                        <Button
                          variant="link"
                          className={`action-btn btn-edit ${loading ? 'btn-disabled' : ''}`}
                          onClick={() => handleEditClick(provider)}
                          title={loading ? "Espere..." : "Editar proveedor"}
                          disabled={loading}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="link"
                          className={`action-btn btn-erase ${loading ? 'btn-disabled' : ''}`}
                          onClick={() => !loading && handleDeleteClick(id, name)}
                          title={loading ? "Eliminando..." : "Eliminar proveedor"}
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

      {editProvider && (
        <EditProvider
          provider={editProvider}
          onClose={closeEditModal}
        />
      )}

      <DeleteProviderDialog
        open={!!deleteConfirm}
        loading={loading}
        providerName={deleteConfirm?.name}
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

export default ProvidersTable;
