class Sale:
    def __init__(self, id, sale_date, total_amount, payment_method, ticket_url, invoice_state):
        self.id = id
        self.sale_date = sale_date
        self.total_amount = total_amount
        self.payment_method = payment_method
        self.ticket_url = ticket_url
        self.invoice_state = invoice_state

    def __repr__(self):
        return f"Sale(id={self.id}, sale_date={self.sale_date}, total_amount={self.total_amount}, payment_method={self.payment_method}, ticket_url={self.ticket_url}, invoice_state={self.invoice_state})"
    
    def to_dict(self):
        return {
            "id": self.id,
            "sale_date": self.sale_date,
            "total_amount": float(self.total_amount),
            "payment_method": self.payment_method,
            "ticket_url": self.ticket_url,
            "invoice_state": self.invoice_state
        }   
    
    @classmethod
    def from_dict(cls, data):
        return cls(
            id=data.get("id"),
            sale_date=data.get("sale_date"),
            total_amount=data.get("total_amount"),
            payment_method=data.get("payment_method"),
            ticket_url=data.get("ticket_url"),
            invoice_state=data.get("invoice_state")
        )
    

