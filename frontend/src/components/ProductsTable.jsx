import React from "react";
import Header from "./Header";
import Navbar from "./Navbar";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const ProductsTable = ({ products = [] }) => {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Imagen</TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Categoría</TableCell>
                        <TableCell>Precio</TableCell>
                        <TableCell>Stock</TableCell>
                        <TableCell>Código de Barra</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {products.map(({ id, name, barcode, price, stock, url_image, category }) => {
                        const imageToShow = url_image && url_image.length > 0
                            ? url_image[0]
                            : '/Image-not-found.png';
                        return (
                            <TableRow key={id}>
                                <TableCell>
                                    <img
                                        src={imageToShow}
                                        alt={name}
                                        style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                                    />
                                </TableCell>
                                <TableCell>{name}</TableCell>
                                <TableCell>{category}</TableCell>
                                <TableCell>${price}</TableCell>
                                <TableCell>{stock}</TableCell>
                                <TableCell>{barcode}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ProductsTable;
