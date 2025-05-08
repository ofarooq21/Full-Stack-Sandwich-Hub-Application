from pydantic import BaseModel
from typing import Optional

class PromoCodeBase(BaseModel):
    code: str
    discount_amount: float

class PromoCodeCreate(PromoCodeBase):
    pass

class PromoCodeUpdate(BaseModel):
    code: Optional[str] = None
    discount_amount: Optional[float] = None
    active: Optional[bool] = None

class PromoCode(PromoCodeBase):
    id: int
    active: bool

    class Config:
        orm_mode = True
