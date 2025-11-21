import { Modal, Button, Spinner } from 'react-bootstrap';

interface Props {
    open: boolean;
    loading: boolean;
    expenseDescription: string | undefined; 
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteExpenseDialog = ({ open, loading, expenseDescription, onClose, onConfirm }: Props) => {
    return (
        <Modal show={open} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirmar eliminación</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro de que deseas eliminar el gasto "{expenseDescription}"?
                <br />
                Esta acción no se puede deshacer.
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                    Cancelar
                </Button>
                <Button variant="danger" onClick={onConfirm} disabled={loading}>
                    {loading ? (
                        <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                            Eliminando...
                        </>
                    ) : (
                        'Eliminar'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteExpenseDialog;