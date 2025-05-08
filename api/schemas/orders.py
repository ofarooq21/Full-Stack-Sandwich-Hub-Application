from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from .order_details import OrderDetail

class OrderBase(BaseModel):
    customer_name: str
    description: Optional[str] = None
    delivery_type: Optional[str] = "takeout"  # new field
    status: Optional[str] = "pending"         # new field

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    customer_name: Optional[str] = None
    description: Optional[str] = None
    delivery_type: Optional[str] = None
    status: Optional[str] = None

class Order(OrderBase):
    id: int
    order_date: Optional[datetime] = None
    order_details: Optional[List[OrderDetail]] = None

    class Config:
        orm_mode = True
