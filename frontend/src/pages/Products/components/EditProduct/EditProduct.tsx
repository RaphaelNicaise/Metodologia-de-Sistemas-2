import { useState, useEffect, useRef } from "react";
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
import useUpdateProduct from "../../../../hooks/useEditProduct";
import { uploadImageApi } from "../../../../api/productService";
import type { Product, CreateProductData } from "../../../../types/Product";
import './EditProduct.css';

interface Props {
  product: Product;
  onClose: () => void;
}

interface FormDataState {
  name: string;
  barcode: string;
  price: number;
  stock: number;
  category: string;
}

const EditProduct = ({ product, onClose }: Props) => {
  const { updateProduct, loading: updating, error: updateError } = useUpdateProduct();

  const [formData, setFormData] = useState<FormDataState>({
    name: product.name,
    barcode: product.barcode,
    price: product.price,
    stock: product.stock,
    category: product.category
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [currentImage, setCurrentImage] = useState<string | undefined>(product.url_image);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setFormData({
      name: product.name,
      barcode: product.barcode,
      price: product.price,
      stock: product.stock,
      category: product.category
    });
    setCurrentImage(product.url_image);
    setImages([]);
    setImagesPreviews([]);
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value
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

  const removeCurrentImage = () => {
    setCurrentImage(undefined);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      let imageUrl = currentImage;

      // Si se seleccionó una nueva imagen, subirla primero
      if (images.length > 0) {
        try {
          imageUrl = await uploadImageApi(images[0]);
        } catch (error) {
          console.error('Error subiendo imagen:', error);
          throw new Error('Error al subir la imagen');
        }
      }

      const productDataToSubmit: Partial<CreateProductData> = {
        name: formData.name,
        barcode: formData.barcode,
        price: formData.price,
        stock: formData.stock,
        category: formData.category,
        url_image: imageUrl
      };
      
      await updateProduct(product.id, productDataToSubmit);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error al actualizar producto:', error);
    }
  };

  return (
    <Modal
      show={true}
      onHide={onClose}
      size="lg"
      centered
      backdrop="static"
      keyboard={false}
      className="edit-product-modal"
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton={!updating}>
          <Modal.Title as="h2">Editar Producto</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {updateError && (
            <Alert variant="danger">
              Error al actualizar producto: {updateError}
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
                  placeholder="Ej: Coca Cola 2L"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={updating}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formProductBarcode">
                <Form.Label>
                  Código de Barras <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="barcode"
                  placeholder="Ej: 7790001234567"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  required
                  disabled={updating}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formProductPrice">
                <Form.Label>
                  Precio <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  placeholder="Ej: 150.00"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  disabled={updating}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3" controlId="formProductStock">
                <Form.Label>
                  Stock <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="stock"
                  placeholder="Ej: 50"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  required
                  disabled={updating}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formProductCategory">
                <Form.Label>
                  Categoría <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  disabled={updating}
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="Bebidas">Bebidas</option>
                  <option value="Alimentos">Alimentos</option>
                  <option value="Limpieza">Limpieza</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Otros">Otros</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formProductImage">
                <Form.Label>Imagen del Producto</Form.Label>
                <Form.Control
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={updating}
                  multiple
                />
                <Form.Text className="text-muted">
                  Opcional: Selecciona imágenes del producto
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {/* Imagen actual del producto */}
          {currentImage && images.length === 0 && (
            <Row className="mt-3">
              <Col>
                <p className="text-muted mb-2">Imagen actual:</p>
                <div className="image-preview-container">
                  <div className="image-preview-wrapper">
                    <Image
                      src={currentImage}
                      alt="Imagen actual"
                      thumbnail
                      className="preview-image"
                    />
                    <CloseButton
                      className="remove-image-btn"
                      onClick={removeCurrentImage}
                      disabled={updating}
                    />
                  </div>
                </div>
              </Col>
            </Row>
          )}

          {/* Preview de nuevas imágenes */}
          {imagesPreviews.length > 0 && (
            <Row className="mt-3">
              <Col>
                <p className="text-muted mb-2">Nuevas imágenes seleccionadas:</p>
                <div className="image-preview-container">
                  {imagesPreviews.map((preview, index) => (
                    <div key={index} className="image-preview-wrapper">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        thumbnail
                        className="preview-image"
                      />
                      <CloseButton
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                        disabled={updating}
                      />
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={updating}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={updating}
          >
            {updating ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Actualizando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditProduct;
