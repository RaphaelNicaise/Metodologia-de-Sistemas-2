# src/accounting/models/afip_invoices.py

class AFIPInvoice:
    def __init__(self, id=None, sale_id=None, cae=None, cae_expiration=None, 
                invoice_type=None, invoice_number=None):
        self.id = id
        self.sale_id = sale_id
        self.cae = cae  # Código de Autorización Electrónica
        self.cae_expiration = cae_expiration
        self.invoice_type = invoice_type  # A, B, C, etc.
        self.invoice_number = invoice_number

    def __repr__(self):
        return (
            f"AFIPInvoice(id={self.id}, sale_id={self.sale_id}, cae={self.cae}, "
            f"cae_expiration={self.cae_expiration}, invoice_type={self.invoice_type}, "
            f"invoice_number={self.invoice_number})"
        )

    def to_dict(self):
        return {
            "id": self.id,
            "sale_id": self.sale_id,
            "cae": self.cae,
            "cae_expiration": self.cae_expiration,
            "invoice_type": self.invoice_type,
            "invoice_number": self.invoice_number
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            id=data.get("id"),
            sale_id=data.get("sale_id"),
            cae=data.get("cae"),
            cae_expiration=data.get("cae_expiration"),
            invoice_type=data.get("invoice_type"),
            invoice_number=data.get("invoice_number")
        )