from pydantic import BaseModel

class CustomerBase(BaseModel):
    name: str
    email: str
    phone: str | None = None
    address: str | None = None

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int

    class Config:
        orm_mode = True
