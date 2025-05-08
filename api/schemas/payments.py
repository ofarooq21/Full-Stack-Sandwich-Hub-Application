from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class PaymentBase(BaseModel):
    order_id: int
    payment_method: str
    amount: float

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    payment_method: Optional[str] = None
    amount: Optional[float] = None
    payment_status: Optional[str] = None

class Payment(PaymentBase):
    id: int
    payment_status: str
    payment_date: Optional[datetime] = None

    class Config:
        orm_mode = True
