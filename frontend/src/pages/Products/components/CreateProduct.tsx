import React, { useState, useRef } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Spinner,
  Image,
  CloseButton
} from 'react-bootstrap';
import useCreateProduct from "../../../hooks/useCreateProduct";
import { uploadImageApi } from "../../../api/productService";
import type { CreateProductData } from "../../../types/Product";
import './CreateProduct.css';

interface Props {
  onClose: () => void;
}

interface FormDataState {
  name: string;
  barcode: string;
  price: string;
  stock: string;
  category: string;
}

const CreateProduct = ({ onClose }: Props) => {
  const { createProduct, loading: creating, error: createError } = useCreateProduct();

  const initialFormData: FormDataState = {
    name: '',
    barcode: '',
    price: '',
    stock: '',
    category: ''
  };

  const [formData, setFormData] = useState<FormDataState>(initialFormData);
  const [images, setImages] = useState<File[]>([]);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const categories: string[] = [
    'bebidas', 'alimentos', 'limpieza', 'electronicos',
    'ropa', 'hogar', 'deportes', 'juguetes'
  ];


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as keyof FormDataState]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const previews = files.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...files]);
      setImagesPreviews(prev => [...prev, ...previews]);
    }
  };

  const removeImage = (index: number) => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      let imageUrl = '';

      // Si se seleccionó una imagen, subirla primero
      if (images.length > 0) {
        try {
          imageUrl = await uploadImageApi(images[0]);
        } catch (error) {
          console.error('Error subiendo imagen:', error);
          throw new Error('Error al subir la imagen');
        }
      }

      const productDataToSubmit: CreateProductData = {
        name: formData.name,
        barcode: formData.barcode,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        url_image: imageUrl
      };
      
      await createProduct(productDataToSubmit);
      setFormData(initialFormData);
      setImages([]);
      setImagesPreviews([]);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error al crear producto:', error);
    }
  };

  return (
    <Modal
      show={true}
      onHide={onClose} 
      size="xl" 
      centered 
      backdrop="static" 
      keyboard={false} 
      className="create-product-modal" 
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton={!creating}>
          <Modal.Title as="h2">Agregar producto</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {createError && (
            <Alert variant="danger">
              Error al crear producto: {createError}
            </Alert>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formProductName">
                <Form.Label>
                  Nombre del Producto <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Ej: Coca-Cola, Pringles"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={creating}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formProductBarcode">
                <Form.Label>
                  Código de Barra <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="barcode"
                  placeholder="Ej: 0123456789"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  required
                  disabled={creating}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formProductPrice">
                <Form.Label>
                  Precio <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  placeholder="Ej: 10000"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  disabled={creating}
                  step="0.01" 
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formProductStock">
                <Form.Label>Stock</Form.Label>
                <Form.Control
                  type="number"
                  name="stock"
                  placeholder="Ej: 25"
                  value={formData.stock}
                  onChange={handleInputChange}
                  disabled={creating}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3" controlId="formProductCategory">
                <Form.Label>
                  Categoría <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  disabled={creating}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formProductImage">
                <Form.Label>
                  Imagen <span className="text-muted">(no es obligatorio)</span>
                </Form.Label>
                <Form.Control
                  type="file"
                  name="url_image"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  disabled={creating}
                />
              </Form.Group>

              {imagesPreviews.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {imagesPreviews.map((preview, index) => (
                    <div key={index} className="image-preview-container">
                      <Image
                        src={preview}
                        alt={`Preview ${index}`}
                        thumbnail 
                        className="image-preview-thumbnail"
                      />
                      <CloseButton
                        variant="white" 
                        className="image-preview-remove-btn"
                        onClick={() => removeImage(index)}
                        disabled={creating}
                        aria-label="Remove image"
                      />
                    </div>
                  ))}
                </div>
              )}
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="danger" 
            onClick={onClose}
            disabled={creating}
          >
            Cancelar
          </Button>
          <Button
            variant="success" 
            type="submit"
            disabled={creating}
          >
            {creating ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Creando...
              </>
            ) : (
              'Crear Producto'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateProduct;