import type { Product } from "../../../types/Product";
import '../../../styles/Products.css';
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
        <div className="product-card">
            <div className="product-image-container">
                <img
                    src={imageToShow}
                    alt={name}
                    className="product_image"
                />
            </div>

            <div className="product-card-info">
                <h2 className="product-title">{name}</h2>
                <p className="product-category">{category}</p>

                <div className="product-card-meta">
                    <div className="product-price">
                        <strong>Precio:</strong>
                        <span>${price}</span>
                    </div>
                    <div className="product-stock">
                        <strong>Stock:</strong>
                        <span>{stock}</span>
                    </div>
                    <div className="product-barcode">
                        <strong>Codigo de Barra:</strong>
                        <span>{barcode}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductCard;