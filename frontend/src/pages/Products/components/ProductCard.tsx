import { Card, ListGroup } from 'react-bootstrap';
import type { Product } from "../../../types/Product";
import './ProductCard.css';

const ProductCard = ({
    name,
    barcode,
    price,
    stock,
    url_image,
    category
}: Product) => {

    const imageToShow = url_image || '/Image-not-found.png';

    return (
        <Card className="h-100 shadow-sm product-card-rb">
            
            <Card.Img
                variant="top"
                src={imageToShow}
                alt={name}
                className="product-card-rb-image" 
            />


            <Card.Body className="d-flex flex-column">
                
                <Card.Title as="h2" className="product-title">{name}</Card.Title>
                
                <Card.Subtitle as="p" className="mb-2 text-muted product-category">
                    {category}
                </Card.Subtitle>

                <ListGroup variant="flush" className="mt-auto product-card-meta">
                    <ListGroup.Item className="d-flex justify-content-between">
                        <strong>Precio:</strong>
                        <span>${price}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                        <strong>Stock:</strong>
                        <span>{stock}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                        <strong>Código de Barra:</strong>
                        <span>{barcode}</span>
                    </ListGroup.Item>
                </ListGroup>

            </Card.Body>
        </Card>
    )
}

export default ProductCard;