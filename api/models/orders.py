# File: api/models/orders.py
from sqlalchemy import Column, Integer, String, DECIMAL, DATETIME, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..dependencies.database import Base

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    order_date = Column(DATETIME, nullable=False, server_default=str(datetime.now()))
    tracking_number = Column(String(50), unique=True, nullable=True)
    status = Column(String(50), default="pending")
    total_price = Column(DECIMAL(8, 2), nullable=False)
    
    # Relationships
    customer = relationship("Customer")
    order_details = relationship("OrderDetail", back_populates="order")
    payment = relationship("Payment", uselist=False, back_populates="order")
    review = relationship("Review", uselist=False, back_populates="order")
