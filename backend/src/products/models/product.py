class Product:
    def __init__(self, id=None, name=None ,barcode=None, price=None, stock=None,  category=None):
        self.id = id
        self.name = name
        self.barcode = barcode
        self.price = price
        self.stock = stock
        self.category = category

    def __repr__(self):
        return f"Product(id={self.id}, name={self.name}, barcode={self.barcode}, price={self.price}, stock={self.stock}, category={self.category})"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "barcode": self.barcode,
            "price": self.price,
            "stock": self.stock,
            "category": self.category
        }
    
    @classmethod
    def from_dict(cls, data):
        return cls(
            id=data.get("id"),
            name=data.get("name"),
            barcode=data.get("barcode"),
            price=data.get("price"),
            stock=data.get("stock"),
            category=data.get("category")
        )