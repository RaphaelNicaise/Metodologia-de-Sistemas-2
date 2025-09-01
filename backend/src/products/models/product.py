class Product:
    def __init__(self, id=None, name=None, barcode=None, price=None, stock=None, url_image=None):
        self.id = id
        self.name = name
        self.barcode = barcode
        self.price = price
        self.stock = stock
        self.url_image = url_image

    def __repr__(self):
        return (f"Product(id={self.id}, name={self.name}, barcode={self.barcode}, price={self.price}, "
                f"stock={self.stock},  url_image={self.url_image})")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "barcode": self.barcode,
            "price": self.price,
            "stock": self.stock,
            "url_image": self.url_image
        }
    
    @classmethod
    def from_dict(cls, data):
        return cls(
            id=data.get("id"),
            name=data.get("name"),
            barcode=data.get("barcode"),
            price=data.get("price"),
            stock=data.get("stock"),
            url_image=data.get("url_image")
        )