class SaleProduct:
    def __init__(self, id, sale_id, product_id, quantity, unit_price):
        self.id = id
        self.sale_id = sale_id
        self.product_id = product_id
        self.quantity = quantity
        self.unit_price = unit_price

    def __repr__(self):
        return f"SaleProduct(id={self.id}, sale_id={self.sale_id}, product_id={self.product_id}, quantity={self.quantity}, unit_price={self.unit_price})"

    def to_dict(self):
        return {
            "id": self.id,
            "sale_id": self.sale_id,
            "product_id": self.product_id,
            "quantity": self.quantity,
            "unit_price": float(self.unit_price)
        }   
    
    @classmethod
    def from_dict(cls, data):
        return cls(
            id=data.get("id"),
            sale_id=data.get("sale_id"),
            product_id=data.get("product_id"),
            quantity=data.get("quantity"),
            unit_price=data.get("unit_price")
        )
    