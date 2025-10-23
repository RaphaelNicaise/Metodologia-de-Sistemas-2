import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress
} from '@mui/material';

const DeleteProductDialog = ({ open, loading, productName, onClose, onConfirm }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            className="delete-dialog"
        >
            <DialogTitle id="alert-dialog-title" className="dialog-title">
                Confirmar eliminación
            </DialogTitle>
            <DialogContent className="dialog-content">
                ¿Estás seguro de que deseas eliminar el producto "{productName}"?
                Esta acción no se puede deshacer.
            </DialogContent>
            <DialogActions className="dialog-actions">
                <Button onClick={onClose} disabled={loading} className="dialog-cancel-btn">
                    Cancelar
                </Button>
                <Button
                    onClick={onConfirm}
                    color="error"
                    disabled={loading}
                    className="dialog-confirm-btn"
                    startIcon={loading ? <CircularProgress size={16} className="loading-spinner" /> : null}
                >
                    {loading ? 'Eliminando...' : 'Eliminar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteProductDialog;