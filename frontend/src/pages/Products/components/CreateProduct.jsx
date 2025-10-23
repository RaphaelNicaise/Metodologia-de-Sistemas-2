import React, { useState, useRef } from "react";
import useCreateProduct from "../../../hooks/useCreateProduct";
import '../../../styles/CreateProduct.css';

const CreateProduct = ({ onClose }) => {
    const { createProduct, loading: creating, error: createError } = useCreateProduct();

    const [formData, setFormData] = useState({
        name: '',
        barcode: '',
        price: '',
        stock: '',
        category: ''
    });

    // Archivos y previews
    const [images, setImages] = useState([]);
    const [imagesPreviews, setImagesPreviews] = useState([]);
    const fileInputRef = useRef(null);


    const categories = [
        'bebidas',
        'alimentos',
        'limpieza',
        'electronicos',
        'ropa',
        'hogar',
        'deportes',
        'juguetes'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        const previews = files.map(file => URL.createObjectURL(file));

        setImages(prev => [...prev, ...files]);
        setImagesPreviews(prev => [...prev, ...previews]);
    };

    const removeImage = (index) => {
        const newPreviews = [...imagesPreviews];
        const newImages = [...images];

        newPreviews.splice(index, 1);
        newImages.splice(index, 1);

        setImagesPreviews(newPreviews);
        setImages(newImages);

        if (newImages.length === 0 && fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Podés mandar "images" a tu backend o a MinIO
            await createProduct({
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock) || 0,
                // url_image se cargaría después de subir las imágenes
                url_image: images.length > 0 ? images[0].name : ''
            });

            setFormData({
                name: '',
                barcode: '',
                price: '',
                stock: '',
                category: '',
            });
            setImages([]);
            setImagesPreviews([]);
            onClose();
            window.location.reload();
        } catch (error) {
            console.error('Error al crear producto:', error);
        }
    };

    return (
        <div className="add-product-container">
            <div className="form-add-product">
                <h2>Agregar producto</h2>
                <div className="form-product-inputs">
                    {createError && (
                        <div className="error-message">
                            Error al crear producto: {createError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="form-product-container">
                        <div className="form-product-inputs">
                            <span>Nombre del Producto<span style={{ color: "red" }}>*</span></span>
                            <input
                                type="text"
                                name="name"
                                placeholder="Ej: Coca-Cola, Pringles"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                            <span>Codigo de Barra<span style={{ color: "red" }}>*</span></span>
                            <input
                                type="text"
                                name="barcode"
                                placeholder="Ej: 0123456789"
                                value={formData.barcode}
                                onChange={handleInputChange}
                                required
                            />
                            <span>Precio<span style={{ color: "red" }}>*</span></span>
                            <input
                                type="number"
                                name="price"
                                placeholder="Ej: $10,000"
                                value={formData.price}
                                onChange={handleInputChange}
                                required
                            />
                            <span>Stock</span>
                            <input
                                type="number"
                                name="stock"
                                placeholder="Ej: 25"
                                value={formData.stock}
                                onChange={handleInputChange}
                                
                            />
                            <span>Categoria<span style={{ color: "red" }}>*</span></span>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Selecciona una categoría</option>
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            <span>Imagen <span style={{ color: "grey" }}>(no es obligatorio)</span></span>
                            <input
                                type="file"
                                name="url_image"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                            />

                            {imagesPreviews.length > 0 && (
                                <div className="image-previews">
                                    {imagesPreviews.map((preview, index) => (
                                        <div key={index} className="image-preview">
                                            <img src={preview} alt={`Preview ${index}`} />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="remove-image-btn"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="form-buttons">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={creating}
                                id="btn-cancel"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={creating}
                                id="btn-add"
                            >
                                {creating ? 'Creando...' : 'Crear Producto'}
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default CreateProduct;
