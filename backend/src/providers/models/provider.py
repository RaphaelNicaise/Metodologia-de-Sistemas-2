class Provider:
    def __init__(self, id=None, name=None, contact_email=None, phone_number=None, address=None, description=None):
        self.id = id
        self.name = name
        self.contact_email = contact_email
        self.phone_number = phone_number
        self.address = address
        self.description = description

    def __repr__(self):
        return (f"Provider(id={self.id}, name={self.name}, contact_email={self.contact_email}, "
                f"phone_number={self.phone_number}, address={self.address}, description={self.description})")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "contact_email": self.contact_email,
            "phone_number": self.phone_number,
            "address": self.address,
            "description": self.description
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            id=data.get("id"),
            name=data.get("name"),
            contact_email=data.get("contact_email"),
            phone_number=data.get("phone_number"),
            address=data.get("address"),
            description=data.get("description")
        )