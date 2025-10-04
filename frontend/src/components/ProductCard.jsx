import React from "react";
import '../styles/ProductCard.css';

const ProductCard = ({ id, name, barcode, price, stock, url_image, category }) => {
    const imageToShow = url_image && url_image.length > 0 ? url_image[0] : '/Image-not-found.png';

    return (
        <div className="product-card" key={id}>
            <div className="product-image-container">
                <img
                    src={imageToShow}
                    alt="img_principal_producto"
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