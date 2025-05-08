from datetime import date
from pydantic import BaseModel
from typing import Optional

class PromotionBase(BaseModel):
    promo_code: str
    discount_amount: float
    expiration_date: date
    active: Optional[bool] = True

class PromotionCreate(PromotionBase):
    pass

class Promotion(PromotionBase):
    id: int

    class Config:
        orm_mode = True
