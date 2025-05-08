from sqlalchemy import Column, Integer, String, Boolean, DECIMAL, Date
from datetime import date
from ..dependencies.database import Base

class Promotion(Base):
    __tablename__ = "promotions"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    promo_code = Column(String(50), unique=True, nullable=False)
    discount_amount = Column(DECIMAL(5, 2), nullable=False)
    expiration_date = Column(Date, nullable=False, default=date.today)
    active = Column(Boolean, default=True)
