# src/sales/models/sale.py
# Modelos simples que reflejan tus tablas reales:
# - sales (encabezado de la venta)
# - sale_product (detalle de productos de la venta)
# No agregamos métodos; dejamos la lógica para services/controllers.

from ...db import db

class Sale(db.Model):
    __tablename__ = "sales"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sale_date = db.Column(db.DateTime, server_default=db.func.now())
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.String(50))
    ticket_url = db.Column(db.String(255))
    invoice_state = db.Column(
        db.Enum("pendiente", "facturado", name="invoice_state"),
        server_default="pendiente",
        nullable=False
    )

class SaleProduct(db.Model):
    __tablename__ = "sale_product"

    # PK compuesta: (sale_id, product_id)
    sale_id = db.Column(
        db.Integer,
        db.ForeignKey("sales.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False
    )
    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False
    )
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
