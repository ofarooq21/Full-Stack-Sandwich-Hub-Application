from sqlalchemy import Column, Integer, String, Boolean, DECIMAL
from ..dependencies.database import Base

class PromoCode(Base):
    __tablename__ = "promocodes"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    code = Column(String(50), unique=True, nullable=False)
    discount_amount = Column(DECIMAL(4, 2), nullable=False)
    active = Column(Boolean, default=True, nullable=False)
